import "server-only";
import YahooFinance from "yahoo-finance2";
import { COMMODITIES } from "@/lib/market/commodities-config";
import { getRealtimeQuote } from "@/lib/market/finnhub";

// Closest JS match to the bot's yfinance calls, same underlying data source.
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const unitBySymbol = Object.fromEntries(COMMODITIES.map((c) => [c.ticker, c.unit]));

// yahoo-finance2 makes its own HTTP calls under the hood, bypassing Next's fetch cache entirely, so without
// this every single page view (now including anonymous ones) re-hit Yahoo fresh for every ticker involved.
// Same manual TTL-cache + in-flight-dedup shape already used in discover.js. 20s keeps quotes feeling live
// while still deduping the common case of several tickers/visitors overlapping within a few seconds.
const QUOTE_CACHE_TTL = 20 * 1000;
const quoteCache = new Map();
const quoteInFlight = new Map();

async function cachedYahooQuote(ticker) {
  const now = Date.now();
  const cached = quoteCache.get(ticker);
  if (cached && now - cached.time < QUOTE_CACHE_TTL) return cached.value;

  const pending = quoteInFlight.get(ticker);
  if (pending) return pending;

  const promise = yf
    .quote(ticker)
    .then((value) => {
      quoteCache.set(ticker, { value, time: Date.now() });
      quoteInFlight.delete(ticker);
      return value;
    })
    .catch((err) => {
      quoteInFlight.delete(ticker);
      throw err;
    });
  quoteInFlight.set(ticker, promise);
  return promise;
}

export async function getQuote(ticker) {
  try {
    // Concurrent, not sequential, so the real-time overlay doesn't add extra wait time on top of the Yahoo call.
    // Finnhub's own real-time price still refreshes independently (5s revalidate in finnhub.js), only the
    // slower-changing Yahoo fields (name, ranges, market cap, exchange) are the ones being cached here.
    const [q, realtime] = await Promise.all([cachedYahooQuote(ticker), getRealtimeQuote(ticker)]);
    if (!q || q.regularMarketPrice == null) return null;

    return {
      ticker: q.symbol,
      name: q.longName || q.shortName || q.symbol,
      price: realtime?.c ?? q.regularMarketPrice,
      change: realtime?.d ?? q.regularMarketChange,
      changePct: realtime?.dp ?? q.regularMarketChangePercent,
      dayLow: realtime?.l ?? q.regularMarketDayLow,
      dayHigh: realtime?.h ?? q.regularMarketDayHigh,
      yearLow: q.fiftyTwoWeekLow,
      yearHigh: q.fiftyTwoWeekHigh,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      // Lets the ticker page show "Toronto . CAD" instead of assuming USD.
      currency: q.currency,
      exchange: q.fullExchangeName || q.exchange || null,
      // "per ounce"/"per barrel", only set for the 4 commodity futures above.
      unit: unitBySymbol[q.symbol] ?? null,
    };
  } catch {
    return null;
  }
}

const INDICES = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "Nasdaq" },
  { symbol: "^DJI", label: "Dow" },
];

export async function getMarketSnapshot() {
  const results = await Promise.all(
    INDICES.map(async ({ symbol, label }) => {
      const quote = await getQuote(symbol);
      return quote ? { label, price: quote.price, changePct: quote.changePct } : null;
    })
  );
  return results.filter((r) => r !== null);
}

export async function getCommodities() {
  const results = await Promise.all(
    COMMODITIES.map(async ({ slug, ticker, label, unit }) => {
      const quote = await getQuote(ticker);
      return quote ? { ...quote, slug, label, unit } : null;
    })
  );
  return results.filter((r) => r !== null);
}

export async function getRelatedTickers(ticker, limit = 5) {
  try {
    const result = await yf.recommendationsBySymbol(ticker);
    const symbols = (result.recommendedSymbols ?? []).slice(0, limit).map((r) => r.symbol);
    const quotes = await Promise.all(symbols.map((s) => getQuote(s)));
    return quotes.filter((q) => q !== null);
  } catch {
    return [];
  }
}

// Same ranges as the bot's /stock command, plus 10Y since the web chart can go further back.
const RANGE_OPTIONS = {
  "1d": { days: 1, interval: "5m", label: "1D" },
  "1w": { days: 7, interval: "30m", label: "1W" },
  "1mo": { days: 30, interval: "1d", label: "1M" },
  "3mo": { days: 90, interval: "1d", label: "3M" },
  "6mo": { days: 180, interval: "1d", label: "6M" },
  "ytd": { ytd: true, interval: "1d", label: "YTD" },
  "1y": { days: 365, interval: "1d", label: "1Y" },
  "5y": { days: 365 * 5, interval: "1wk", label: "5Y" },
  "10y": { days: 365 * 10, interval: "1wk", label: "10Y" },
};

// Chart history is the most expensive Yahoo call (up to 10 years of bars) and was being refetched from
// scratch on every page view with no caching at all. Intraday ranges still change through the trading day
// so get a short TTL, daily-bar-and-up ranges only update once a day so a longer TTL is free accuracy-wise.
const HISTORY_CACHE_TTL_INTRADAY = 60 * 1000;
const HISTORY_CACHE_TTL_DAILY = 5 * 60 * 1000;
const historyCache = new Map();
const historyInFlight = new Map();

export async function getHistory(ticker, range = "3mo") {
  const opts = RANGE_OPTIONS[range] ?? RANGE_OPTIONS["3mo"];
  const cacheKey = `${ticker}:${range}`;
  const ttl = range === "1d" || range === "1w" ? HISTORY_CACHE_TTL_INTRADAY : HISTORY_CACHE_TTL_DAILY;

  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.time < ttl) return cached.value;

  const pending = historyInFlight.get(cacheKey);
  if (pending) return pending;

  // YTD starts from Jan 1, not a fixed day count back from today.
  const period1 = opts.ytd
    ? new Date(new Date().getFullYear(), 0, 1)
    : new Date(Date.now() - opts.days * 24 * 60 * 60 * 1000);

  const promise = (async () => {
    try {
      const result = await yf.chart(ticker, { period1, interval: opts.interval });
      // Seconds, not a date string, lightweight-charts needs this for intraday ranges too.
      const value = result.quotes
        .filter((q) => q.close != null)
        .map((q) => ({ time: Math.floor(q.date.getTime() / 1000), value: q.close }));
      historyCache.set(cacheKey, { value, time: Date.now() });
      return value;
    } catch {
      return [];
    } finally {
      historyInFlight.delete(cacheKey);
    }
  })();
  historyInFlight.set(cacheKey, promise);
  return promise;
}
