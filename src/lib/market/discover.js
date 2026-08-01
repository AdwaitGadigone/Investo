import "server-only";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Real, live "most actively traded" stocks, not a fixed hand-picked list, so "Popular
// right now" is always fresh and never runs out no matter how many someone adds.
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

// Gainers/losers straight from Yahoo, but filtered down to companies with a real market
// cap and sorted by size, the raw screener result skews toward tiny, unrecognizable
// microcaps moving on thin volume, this surfaces the big names people actually know.
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

// A simple in-memory cache, this is expensive to compute (5 years of weekly history for
// 25 tickers) and doesn't need to be any fresher than once an hour. Shared by Top
// Performers and Market Movers' non-"day" tabs, one history pull per ticker covers every
// longer period for both.
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000;

function closestPoint(points, targetTime) {
  return points.reduce((best, p) =>
    Math.abs(p.time - targetTime) < Math.abs(best.time - targetTime) ? p : best
  );
}

const PERIOD_DAYS = { week: 7, month: 30, threeMonth: 90, year: 365, fiveYear: 365 * 5 };

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

        // Yahoo's most recent weekly bar represents the still-in-progress current week,
        // its "close" is really just today's live price, not a real completed week, so
        // anything less than 6 days old can't be used as a genuine historical reference,
        // that mistake was making "this week" always show as a flat 0% for every ticker.
        const completed = points.filter((p) => nowTime - p.time > 6 * 24 * 60 * 60 * 1000);
        if (completed.length < 2) return null;

        const changes = {};
        for (const [key, days] of Object.entries(PERIOD_DAYS)) {
          const past = closestPoint(completed, nowTime - days * 24 * 60 * 60 * 1000);
          changes[key] = {
            amount: past.value ? price - past.value : 0,
            pct: past.value ? ((price - past.value) / past.value) * 100 : 0,
          };
        }

        // A trimmed tail of the same weekly history already fetched for the period math,
        // reused as sparkline points instead of pulling a second, separate history call
        // per ticker just for the little chart next to the name.
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

// Ranks the same "most active" universe by how much they've actually gained over each
// period. "day" is the odd one out, the screener already hands back today's change
// directly, no history fetch needed for that one.
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

  for (const period of Object.keys(PERIOD_DAYS)) {
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

// Same "gainers / losers / most active" shape as the day tab, but for every period. Gainers
// and losers for "day" come from Yahoo's real market-wide screeners (a much bigger universe
// than the 25 most-active tickers), longer periods reuse the ranked universe above since
// there's no "week_gainers"/"month_gainers" screener to pull from directly. "Most active" is
// volume-based and only ever reflects today, that stays constant across every period tab.
export async function getMarketMovers() {
  const [dayGainers, dayLosers, active, { valid }] = await Promise.all([
    getScreenerByMarketCap("day_gainers"),
    getScreenerByMarketCap("day_losers"),
    getMostActive(25).then((rows) => rows.slice(0, 5)),
    getRankedUniverse(),
  ]);

  const movers = { day: { gainers: dayGainers, losers: dayLosers, active } };

  for (const period of Object.keys(PERIOD_DAYS)) {
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
