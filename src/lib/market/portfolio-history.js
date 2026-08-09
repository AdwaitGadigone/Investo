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

  // Different exchanges close their daily bar at different exact seconds, bucket by calendar date instead to sum correctly.
  const isIntraday = range === "1d" || range === "1w";
  const valueByBucket = new Map();
  for (const { shares, history } of histories) {
    for (const point of history) {
      const bucket = isIntraday ? point.time : new Date(point.time * 1000).toISOString().slice(0, 10);
      const existing = valueByBucket.get(bucket) ?? { time: point.time, value: 0 };
      existing.value += point.value * shares;
      valueByBucket.set(bucket, existing);
    }
  }

  return [...valueByBucket.values()].sort((a, b) => a.time - b.time);
}
