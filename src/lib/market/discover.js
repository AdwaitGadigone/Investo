import "server-only";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Real, live "most actively traded" list, so "Popular right now" never runs out.
export async function getMostActive(count = 25) {
  try {
    const result = await yf.screener({ scrIds: "most_actives", count });
    return result.quotes
      .filter((q) => q.symbol && q.shortName && q.regularMarketPrice != null)
      .map((q) => ({
        ticker: q.symbol,
        name: q.shortName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange ?? null,
        changePct: q.regularMarketChangePercent ?? null,
      }));
  } catch {
    return [];
  }
}

// Filters to real market-cap companies, the raw screener is mostly thin-volume microcaps.
async function getScreenerByMarketCap(scrId, count = 40, limit = 5) {
  try {
    const result = await yf.screener({ scrIds: scrId, count });
    return result.quotes
      .filter((q) => q.symbol && q.shortName && q.regularMarketPrice != null && q.marketCap != null)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, limit)
      .map((q) => ({
        ticker: q.symbol,
        name: q.shortName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange ?? 0,
        changePct: q.regularMarketChangePercent ?? 0,
      }));
  } catch {
    return [];
  }
}

// Shared cache: 5 years of history for 25 tickers is expensive, an hour stale is fine.
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000;

function closestPoint(points, targetTime) {
  return points.reduce((best, p) =>
    Math.abs(p.time - targetTime) < Math.abs(best.time - targetTime) ? p : best
  );
}

// ytd varies by call date (days since Jan 1), so this is a function, not a static object.
function getPeriodDays() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const ytd = Math.max(1, Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000)));
  return { week: 7, month: 30, threeMonth: 90, ytd, year: 365, fiveYear: 365 * 5 };
}

async function getRankedUniverse() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const universe = await getMostActive(25);
  const nowTime = Date.now();

  const results = await Promise.all(
    universe.map(async ({ ticker, name, price }) => {
      try {
        const result = await yf.chart(ticker, {
          period1: new Date(nowTime - 5 * 365 * 24 * 60 * 60 * 1000),
          interval: "1wk",
        });
        const points = result.quotes
          .filter((q) => q.close != null)
          .map((q) => ({ time: q.date.getTime(), value: q.close }));

        // Drop bars under 6 days old, Yahoo's newest weekly bar is just today's live price.
        const completed = points.filter((p) => nowTime - p.time > 6 * 24 * 60 * 60 * 1000);
        if (completed.length < 2) return null;

        const changes = {};
        for (const [key, days] of Object.entries(getPeriodDays())) {
          const past = closestPoint(completed, nowTime - days * 24 * 60 * 60 * 1000);
          changes[key] = {
            amount: past.value ? price - past.value : 0,
            pct: past.value ? ((price - past.value) / past.value) * 100 : 0,
          };
        }

        // Reuses the same weekly history as a sparkline, no second fetch needed.
        return { ticker, name, price, changes, sparkline: completed.slice(-12) };
      } catch {
        return null;
      }
    })
  );

  const valid = results.filter((r) => r !== null);
  cache = { universe, valid };
  cacheTime = Date.now();
  return cache;
}

// "day" skips the history fetch, the screener already gives today's change directly.
export async function getTopPerformers() {
  const { universe, valid } = await getRankedUniverse();
  const sparklineByTicker = Object.fromEntries(valid.map((r) => [r.ticker, r.sparkline]));
  const ranked = {};

  ranked.day = [...universe]
    .filter((u) => u.changePct != null)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5)
    .map((u) => ({
      ticker: u.ticker,
      name: u.name,
      price: u.price,
      change: u.change,
      changePct: u.changePct,
      history: sparklineByTicker[u.ticker] ?? null,
    }));

  for (const period of Object.keys(getPeriodDays())) {
    ranked[period] = [...valid]
      .sort((a, b) => b.changes[period].pct - a.changes[period].pct)
      .slice(0, 5)
      .map((r) => ({
        ticker: r.ticker,
        name: r.name,
        price: r.price,
        change: r.changes[period].amount,
        changePct: r.changes[period].pct,
        history: r.sparkline,
      }));
  }

  return ranked;
}

// Per-ticker (not per-user), since the same ticker across different watchlists shares history.
const periodChangeCache = new Map();

// Arbitrary user-picked tickers, unlike the fixed universe above, so this fetches separately.
export async function getPeriodChanges(tickers) {
  const nowTime = Date.now();
  const entries = await Promise.all(
    tickers.map(async (ticker) => {
      const cached = periodChangeCache.get(ticker);
      if (cached && nowTime - cached.time < CACHE_TTL) return [ticker, cached.changes];

      try {
        const result = await yf.chart(ticker, {
          period1: new Date(nowTime - 5 * 365 * 24 * 60 * 60 * 1000),
          interval: "1wk",
        });
        const points = result.quotes
          .filter((q) => q.close != null)
          .map((q) => ({ time: q.date.getTime(), value: q.close }));
        const completed = points.filter((p) => nowTime - p.time > 6 * 24 * 60 * 60 * 1000);
        if (completed.length < 2) return [ticker, null];

        const latest = points[points.length - 1].value;
        const changes = {};
        for (const [key, days] of Object.entries(getPeriodDays())) {
          const past = closestPoint(completed, nowTime - days * 24 * 60 * 60 * 1000);
          changes[key] = {
            amount: past.value ? latest - past.value : 0,
            pct: past.value ? ((latest - past.value) / past.value) * 100 : 0,
          };
        }

        periodChangeCache.set(ticker, { changes, time: nowTime });
        return [ticker, changes];
      } catch {
        return [ticker, null];
      }
    })
  );

  return Object.fromEntries(entries);
}

// Non-"day" periods reuse the ranked universe, there's no "week_gainers" screener to pull from.
export async function getMarketMovers() {
  const [dayGainers, dayLosers, active, { valid }] = await Promise.all([
    getScreenerByMarketCap("day_gainers"),
    getScreenerByMarketCap("day_losers"),
    getMostActive(25).then((rows) => rows.slice(0, 5)),
    getRankedUniverse(),
  ]);

  const movers = { day: { gainers: dayGainers, losers: dayLosers, active } };

  for (const period of Object.keys(getPeriodDays())) {
    const sorted = [...valid].sort((a, b) => b.changes[period].pct - a.changes[period].pct);
    const toRow = (r) => ({
      ticker: r.ticker,
      name: r.name,
      price: r.price,
      change: r.changes[period].amount,
      changePct: r.changes[period].pct,
    });
    movers[period] = {
      gainers: sorted.slice(0, 5).map(toRow),
      losers: sorted.slice(-5).reverse().map(toRow),
      active,
    };
  }

  return movers;
}
