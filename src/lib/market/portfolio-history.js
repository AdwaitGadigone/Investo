import "server-only";
import { getHistory, getQuote, getFxRatesFor } from "@/lib/market/yahoo";

// Turns a position's historical price point into its contribution to portfolio value, same construction
// the dashboard's "Total Value" card uses: for a short this isn't the notional, it's built so that
// (value - cost) always equals that position's correctly-signed P/L, long or short alike.
function contribution(point, shares, costBasis, isShort, rate) {
  const value = point * shares;
  const cost = costBasis * shares;
  return (isShort ? 2 * cost - value : value) * rate;
}

// Approximate: current share count applied to past prices, there's no transaction log to know exact buy dates.
export async function getPortfolioHistory(positions, range = "1mo") {
  if (positions.length === 0) return [];

  const quotes = await Promise.all(positions.map((p) => getQuote(p.ticker)));
  const currencies = quotes.map((q) => q?.currency ?? "USD");
  const fxRates = await getFxRatesFor(currencies);

  const histories = await Promise.all(
    positions.map(async (p, i) => ({
      shares: p.shares,
      costBasis: p.cost_basis,
      isShort: p.direction === "short",
      rate: currencies[i] === "USD" ? 1 : fxRates[currencies[i]] ?? 1,
      history: await getHistory(p.ticker, range),
    }))
  );

  if (range !== "1d" && range !== "5d") {
    // Different exchanges close their daily bar at different exact seconds, bucket by calendar date instead to sum correctly.
    const valueByBucket = new Map();
    for (const { shares, costBasis, isShort, rate, history } of histories) {
      for (const point of history) {
        const bucket = new Date(point.time * 1000).toISOString().slice(0, 10);
        const existing = valueByBucket.get(bucket) ?? { time: point.time, value: 0 };
        existing.value += contribution(point.value, shares, costBasis, isShort, rate);
        valueByBucket.set(bucket, existing);
      }
    }
    return [...valueByBucket.values()].sort((a, b) => a.time - b.time);
  }

  // Intraday: stocks only have bars during market hours but crypto trades 24/7, so summing only exact
  // timestamp matches would silently drop every stock position outside market hours. Forward-fill each
  // ticker's last known price into every timestamp instead, a standard as-of join for mixed-frequency series.
  const allTimes = [...new Set(histories.flatMap(({ history }) => history.map((p) => p.time)))].sort(
    (a, b) => a - b
  );
  const pointers = histories.map(() => 0);
  const lastPrice = histories.map(() => null);

  return allTimes.map((time) => {
    let value = 0;
    histories.forEach(({ shares, costBasis, isShort, rate, history }, i) => {
      while (pointers[i] < history.length && history[pointers[i]].time <= time) {
        lastPrice[i] = history[pointers[i]].value;
        pointers[i]++;
      }
      if (lastPrice[i] != null) value += contribution(lastPrice[i], shares, costBasis, isShort, rate);
    });
    return { time, value };
  });
}
