import "server-only";
import { getHistory } from "@/lib/market/yahoo";

// Approximates portfolio value over time by combining each position's own price history
// with its CURRENT share count. This can't know exactly when shares were bought (the
// schema has no transaction log, positions blend into one running average), so it's really
// "what today's holdings would have been worth on each past date," not a perfect ledger,
// but it's an honest, real chart, not a fabricated one.
export async function getPortfolioHistory(positions, range = "3mo") {
  if (positions.length === 0) return [];

  const histories = await Promise.all(
    positions.map(async (p) => ({
      shares: p.shares,
      history: await getHistory(p.ticker, range),
    }))
  );

  const valueByTime = new Map();
  for (const { shares, history } of histories) {
    for (const point of history) {
      const existing = valueByTime.get(point.time) ?? 0;
      valueByTime.set(point.time, existing + point.value * shares);
    }
  }

  return [...valueByTime.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, value]) => ({ time, value }));
}
