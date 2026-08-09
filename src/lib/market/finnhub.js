import "server-only";

const KEY = process.env.FINNHUB_API_KEY;

export async function getCompanyNews(ticker, daysBack = 5) {
  if (!KEY) return [];

  const to = new Date();
  const from = new Date(to.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${fmt(from)}&to=${fmt(to)}&token=${KEY}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Aggregates headlines across a whole watchlist into one feed, this is what /news is for.
export async function getAggregatedNews(tickers, perTicker = 4) {
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const articles = await getCompanyNews(ticker, 3);
      return articles.slice(0, perTicker).map((a) => ({ ...a, ticker }));
    })
  );

  return results.flat().sort((a, b) => (b.datetime ?? 0) - (a.datetime ?? 0));
}

// Real-time for US stocks unlike Yahoo's delayed free feed, returns null for anything else it doesn't cover.
export async function getRealtimeQuote(ticker) {
  if (!KEY) return null;

  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${KEY}`, {
      next: { revalidate: 5 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.c) return null;
    return data;
  } catch {
    return null;
  }
}

// Free tier has no price target, but recommendation trends (buy/hold/sell) are free.
export async function getRecommendationTrends(ticker) {
  if (!KEY) return null;

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/recommendation?symbol=${encodeURIComponent(ticker)}&token=${KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}
