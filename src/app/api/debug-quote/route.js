import { getQuote, getHistory, getRelatedTickers } from "@/lib/market/yahoo";
import { getCompanyNews, getRecommendationTrends } from "@/lib/market/finnhub";

// Temporary diagnostic route, delete once the commodity ticker 404 is root-caused.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "GC=F";
  const result = { ticker, nodeVersion: process.version };

  try {
    result.quote = await getQuote(ticker);
  } catch (err) {
    result.quoteError = err.message;
  }

  try {
    result.historyLength = (await getHistory(ticker, "3mo")).length;
  } catch (err) {
    result.historyError = err.message;
  }

  try {
    result.newsLength = (await getCompanyNews(ticker)).length;
  } catch (err) {
    result.newsError = err.message;
  }

  try {
    result.trends = await getRecommendationTrends(ticker);
  } catch (err) {
    result.trendsError = err.message;
  }

  try {
    result.relatedLength = (await getRelatedTickers(ticker)).length;
  } catch (err) {
    result.relatedError = err.message;
  }

  return Response.json(result);
}
