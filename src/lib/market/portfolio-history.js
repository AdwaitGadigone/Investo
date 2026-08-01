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
