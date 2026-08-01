import { getQuote, getHistory } from "@/lib/market/yahoo";

// Temporary diagnostic route, not linked from anywhere in the UI. Remove once the
// commodity ticker 404 is actually root-caused, this is not meant to stay.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "GC=F";

  try {
    const [quote, history] = await Promise.all([getQuote(ticker), getHistory(ticker, "3mo")]);
    return Response.json({
      ticker,
      quote,
      historyLength: history.length,
      nodeVersion: process.version,
    });
  } catch (err) {
    return Response.json(
      { ticker, error: err.message, stack: err.stack, nodeVersion: process.version },
      { status: 500 }
    );
  }
}
