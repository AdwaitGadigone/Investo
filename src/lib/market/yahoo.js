import "server-only";
import YahooFinance from "yahoo-finance2";

// One shared instance, this is what the bot's yfinance calls become on the JS side, no
// direct Python equivalent exists so this is the closest match (same underlying source).
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function getQuote(ticker) {
  try {
    const q = await yf.quote(ticker);
    if (!q || q.regularMarketPrice == null) return null;

    return {
      ticker: q.symbol,
      name: q.longName || q.shortName || q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePct: q.regularMarketChangePercent,
      dayLow: q.regularMarketDayLow,
      dayHigh: q.regularMarketDayHigh,
      yearLow: q.fiftyTwoWeekLow,
      yearHigh: q.fiftyTwoWeekHigh,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      // Yahoo mixes US, Canadian, and other exchanges into the same search/quote results
      // with no visual distinction by default, this is what lets the ticker page say
      // "Toronto . CAD" instead of leaving people to guess why a price looks off.
      currency: q.currency,
      exchange: q.fullExchangeName || q.exchange || null,
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

// Commodity futures (gold, silver, oil) barely show up in Yahoo's fuzzy text search,
// "gold" surfaces an unrelated small-cap company called Gold.com before the actual metal,
// so these are surfaced directly instead of relying on search to find them.
const COMMODITIES = [
  { symbol: "GC=F", label: "Gold" },
  { symbol: "SI=F", label: "Silver" },
  { symbol: "CL=F", label: "Oil" },
  { symbol: "NG=F", label: "Natural Gas" },
];

export async function getCommodities() {
  const results = await Promise.all(
    COMMODITIES.map(async ({ symbol, label }) => {
      const quote = await getQuote(symbol);
      return quote ? { ...quote, label } : null;
    })
  );
  return results.filter((r) => r !== null);
}

// Yahoo's own "People Also Watch" data for a ticker page, just symbols + a relevance
// score by default, fetching real quotes for each is what turns that into something
// actually useful to look at instead of a bare list of tickers.
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

// Same range picker as the bot's /stock command, plus 10Y since the web chart is meant to
// go further back than a Discord embed reasonably could.
export const RANGE_OPTIONS = {
  "1d": { days: 1, interval: "5m", label: "1D" },
  "1w": { days: 7, interval: "30m", label: "1W" },
  "1mo": { days: 30, interval: "1d", label: "1M" },
  "3mo": { days: 90, interval: "1d", label: "3M" },
  "6mo": { days: 180, interval: "1d", label: "6M" },
  "1y": { days: 365, interval: "1d", label: "1Y" },
  "5y": { days: 365 * 5, interval: "1wk", label: "5Y" },
  "10y": { days: 365 * 10, interval: "1wk", label: "10Y" },
};

export async function getHistory(ticker, range = "3mo") {
  const opts = RANGE_OPTIONS[range] ?? RANGE_OPTIONS["3mo"];
  const period1 = new Date(Date.now() - opts.days * 24 * 60 * 60 * 1000);

  try {
    const result = await yf.chart(ticker, { period1, interval: opts.interval });
    // A UNIX timestamp (seconds) works for lightweight-charts at every granularity,
    // intraday (1D/1W) included, unlike a plain "YYYY-MM-DD" string which only works
    // for daily-or-coarser data.
    return result.quotes
      .filter((q) => q.close != null)
      .map((q) => ({ time: Math.floor(q.date.getTime() / 1000), value: q.close }));
  } catch {
    return [];
  }
}
