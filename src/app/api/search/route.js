import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Backs the search bar's autocomplete dropdown, a thin wrapper around Yahoo's own search
// so the client component doesn't need direct network access to a third-party API.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return Response.json({ results: [] });
  }

  try {
    const { quotes } = await yf.search(q, { quotesCount: 6, newsCount: 0 });
    const results = quotes
      .filter((quote) => quote.symbol && (quote.shortname || quote.longname))
      .map((quote) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname,
        exchange: quote.exchDisp,
      }));
    return Response.json({ results });
  } catch {
    return Response.json({ results: [] });
  }
}
