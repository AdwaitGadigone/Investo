import "server-only";
import { getHistory } from "@/lib/market/yahoo";

// Approximate: current share count applied to past prices, there's no transaction log to know exact buy dates.
export async function getPortfolioHistory(positions, range = "3mo") {
  if (positions.length === 0) return [];

  const histories = await Promise.all(
    positions.map(async (p) => ({
      shares: p.shares,
      history: await getHistory(p.ticker, range),
    }))
  );

  if (range !== "1d" && range !== "1w") {
    // Different exchanges close their daily bar at different exact seconds, bucket by calendar date instead to sum correctly.
    const valueByBucket = new Map();
    for (const { shares, history } of histories) {
      for (const point of history) {
        const bucket = new Date(point.time * 1000).toISOString().slice(0, 10);
        const existing = valueByBucket.get(bucket) ?? { time: point.time, value: 0 };
        existing.value += point.value * shares;
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
    histories.forEach(({ shares, history }, i) => {
      while (pointers[i] < history.length && history[pointers[i]].time <= time) {
        lastPrice[i] = history[pointers[i]].value;
        pointers[i]++;
      }
      if (lastPrice[i] != null) value += lastPrice[i] * shares;
    });
    return { time, value };
  });
}
