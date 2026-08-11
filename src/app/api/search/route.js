import YahooFinance from "yahoo-finance2";
import { findCdrMatches } from "@/lib/market/cdrs";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Thin wrapper so the client component doesn't need direct access to Yahoo's API.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return Response.json({ results: [] });
  }

  // The search bar is now reachable by anyone, not just logged-in users, and fires on every keystroke,
  // the one endpoint on the newly-public surface that's actually cheap to hammer with a script.
  if (isRateLimited(getClientIp(request), 60, 60 * 1000)) {
    return Response.json({ results: [] }, { status: 429 });
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

    // Yahoo's own search doesn't surface CDRs for a plain "AAPL" query, so these are added on top.
    const cdrResults = findCdrMatches(q)
      .filter((c) => !results.some((r) => r.symbol === c.ticker))
      .map((c) => ({ symbol: c.ticker, name: `${c.name} CDR (CAD-hedged)`, exchange: "NEO" }));

    return Response.json({ results: [...results, ...cdrResults].slice(0, 8) });
  } catch {
    return Response.json({ results: [] });
  }
}
