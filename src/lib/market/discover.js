import "server-only";
import YahooFinance from "yahoo-finance2";
import { getHistory } from "@/lib/market/yahoo";

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
    let quotes = result.quotes.filter(
      (q) => q.symbol && q.shortName && q.regularMarketPrice != null && q.marketCap != null && q.regularMarketChangePercent != null
    );

    // Yahoo's own day_gainers/day_losers screener bucket can momentarily lag behind the live change
    // field during a fast-moving session, a ticker that was up when Yahoo last ranked the list can
    // have already flipped negative by the time this same response's price field is read. Trusting
    // the screener's category label alone let an actual loser show up inside "Top Gainers", this is
    // the real guard against that happening again, not just a display-order cleanup.
    if (scrId === "day_gainers") quotes = quotes.filter((q) => q.regularMarketChangePercent >= 0);
    else if (scrId === "day_losers") quotes = quotes.filter((q) => q.regularMarketChangePercent <= 0);

    // Filters out thin-volume microcaps first (keeps only the bigger half of real companies in this
    // batch), then ranks THAT set by actual percent move, sorting the final list by market cap alone
    // (the old behavior) meant "Top Gainers" was really "biggest companies that happened to be up",
    // not ranked by how much they'd actually moved, which is what "Top" is supposed to mean here.
    const byCap = [...quotes].sort((a, b) => b.marketCap - a.marketCap).slice(0, Math.max(Math.floor(quotes.length / 2), limit));
    byCap.sort((a, b) => (scrId === "day_losers" ? a.regularMarketChangePercent - b.regularMarketChangePercent : b.regularMarketChangePercent - a.regularMarketChangePercent));

    return byCap.slice(0, limit).map((q) => ({
      ticker: q.symbol,
      name: q.shortName,
      price: q.regularMarketPrice,
      change: q.regularMarketChange ?? 0,
      changePct: q.regularMarketChangePercent,
    }));
  } catch {
    return [];
  }
}

// Shared cache: 5 years of history for 25 tickers is expensive, an hour stale is fine.
let cache = null;
let cacheTime = 0;
// Tracks the fetch itself, not just the result, so two callers in the same request don't both trigger it.
let inFlight = null;
const CACHE_TTL = 60 * 60 * 1000;
// Day-specific screener data refreshes more often than the 5-year history above, but still shouldn't refetch on every page view.
const DAY_CACHE_TTL = 5 * 60 * 1000;
let dayCache = null;
let dayCacheTime = 0;

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
  if (inFlight) return inFlight;

  inFlight = (async () => {
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
    inFlight = null;
    return cache;
  })();

  return inFlight;
}

// Lets suggested-stocks.jsx reuse this same cached fetch instead of hitting the screener again on its own.
export async function getPopularTickers() {
  const { universe } = await getRankedUniverse();
  return universe;
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

        // Prunes expired entries on write instead of a separate cleanup task, keeps this map from growing forever.
        for (const [key, value] of periodChangeCache) {
          if (nowTime - value.time >= CACHE_TTL) periodChangeCache.delete(key);
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

async function getDayMovers(universe) {
  if (dayCache && Date.now() - dayCacheTime < DAY_CACHE_TTL) return dayCache;

  const [dayGainers, dayLosers] = await Promise.all([
    getScreenerByMarketCap("day_gainers"),
    getScreenerByMarketCap("day_losers"),
  ]);
  // Already fetched as part of the ranked universe above, no separate "most active" call needed.
  const active = universe.slice(0, 5);

  // These screener tickers aren't necessarily in the cached ranked universe, so their sparklines need a real fetch.
  const dayTickers = [...dayGainers, ...dayLosers, ...active].map((r) => r.ticker);
  const dayHistories = await Promise.all(dayTickers.map((ticker) => getHistory(ticker, "1mo")));
  const dayHistoryByTicker = Object.fromEntries(dayTickers.map((t, i) => [t, dayHistories[i]]));
  const withDayHistory = (r) => ({ ...r, history: dayHistoryByTicker[r.ticker] ?? null });

  dayCache = {
    gainers: dayGainers.map(withDayHistory),
    losers: dayLosers.map(withDayHistory),
    active: active.map(withDayHistory),
  };
  dayCacheTime = Date.now();
  return dayCache;
}

// Non-"day" periods reuse the ranked universe, there's no "week_gainers" screener to pull from.
export async function getMarketMovers() {
  const { universe, valid } = await getRankedUniverse();
  const movers = { day: await getDayMovers(universe) };
  const active = movers.day.active;

  for (const period of Object.keys(getPeriodDays())) {
    const sorted = [...valid].sort((a, b) => b.changes[period].pct - a.changes[period].pct);
    const toRow = (r) => ({
      ticker: r.ticker,
      name: r.name,
      price: r.price,
      change: r.changes[period].amount,
      changePct: r.changes[period].pct,
      history: r.sparkline,
    });
    // Same guard as getScreenerByMarketCap above: this universe is only 25 tickers, if fewer than 5 are
    // actually down over a given period, just taking the bottom 5 by rank let a real gainer show up under "Losers".
    const gainers = sorted.filter((r) => r.changes[period].pct >= 0).slice(0, 5);
    const losers = sorted.filter((r) => r.changes[period].pct <= 0).slice(-5).reverse();
    movers[period] = {
      gainers: gainers.map(toRow),
      losers: losers.map(toRow),
      active,
    };
  }

  return movers;
}
