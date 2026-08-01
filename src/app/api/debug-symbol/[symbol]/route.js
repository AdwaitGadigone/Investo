import { getQuote } from "@/lib/market/yahoo";

// Temporary: tests the exact [symbol] dynamic-segment decoding the ticker page relies on.
export async function GET(request, { params }) {
  const { symbol } = await params;
  const ticker = symbol.toUpperCase();
  const quote = await getQuote(ticker).catch((err) => ({ __error: err.message }));

  return Response.json({ rawParam: symbol, upperTicker: ticker, quote });
}
