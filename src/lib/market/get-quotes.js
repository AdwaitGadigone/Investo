import "server-only";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Yahoo, not Finnhub: Finnhub has no coverage at all for Canadian-listed tickers (.TO, .NE CDRs),
// so any TSX stock or CDR silently came back with no name, no price, no today's change.
export async function getQuotes(tickers) {
  if (tickers.length === 0) return [];

  try {
    const quotes = await yf.quote(tickers);
    const list = Array.isArray(quotes) ? quotes : [quotes];
    const byTicker = Object.fromEntries(list.map((q) => [q.symbol, q]));

    return tickers.map((ticker) => {
      const q = byTicker[ticker];
      if (!q || q.regularMarketPrice == null) return { ticker, name: null, price: null, change: null, changePct: null };
      return {
        ticker,
        name: q.longName || q.shortName || ticker,
        price: q.regularMarketPrice,
        change: q.regularMarketChange ?? null,
        changePct: q.regularMarketChangePercent ?? null,
        currency: q.currency,
      };
    });
  } catch {
    return tickers.map((ticker) => ({ ticker, name: null, price: null, change: null, changePct: null }));
  }
}
