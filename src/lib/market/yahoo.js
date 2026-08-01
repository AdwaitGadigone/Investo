import "server-only";
import YahooFinance from "yahoo-finance2";

// Closest JS match to the bot's yfinance calls, same underlying data source.
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Yahoo's text search buries these behind unrelated companies, so they're surfaced directly.
const COMMODITIES = [
  { symbol: "GC=F", label: "Gold", unit: "oz" },
  { symbol: "SI=F", label: "Silver", unit: "oz" },
  { symbol: "CL=F", label: "Oil", unit: "barrel" },
  { symbol: "NG=F", label: "Natural Gas", unit: "MMBtu" },
];
const unitBySymbol = Object.fromEntries(COMMODITIES.map((c) => [c.symbol, c.unit]));

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
    COMMODITIES.map(async ({ symbol, label, unit }) => {
      const quote = await getQuote(symbol);
      return quote ? { ...quote, label, unit } : null;
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
export const RANGE_OPTIONS = {
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

export async function getHistory(ticker, range = "3mo") {
  const opts = RANGE_OPTIONS[range] ?? RANGE_OPTIONS["3mo"];
  // YTD starts from Jan 1, not a fixed day count back from today.
  const period1 = opts.ytd
    ? new Date(new Date().getFullYear(), 0, 1)
    : new Date(Date.now() - opts.days * 24 * 60 * 60 * 1000);

  try {
    const result = await yf.chart(ticker, { period1, interval: opts.interval });
    // Seconds, not a date string, lightweight-charts needs this for intraday ranges too.
    return result.quotes
      .filter((q) => q.close != null)
      .map((q) => ({ time: Math.floor(q.date.getTime() / 1000), value: q.close }));
  } catch {
    return [];
  }
}
