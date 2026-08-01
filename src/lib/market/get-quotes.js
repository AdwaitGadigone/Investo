import "server-only";

// Same Finnhub endpoint as the landing preview, but for any watchlist, not 3 fixed tickers.
export async function getQuotes(tickers) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key || tickers.length === 0) return [];

  const results = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`,
          { cache: "no-store" }
        );
        if (!res.ok) return { ticker, price: null, changePct: null };

        const data = await res.json();
        return { ticker, price: data.c || null, change: data.d ?? null, changePct: data.dp ?? null };
      } catch {
        return { ticker, price: null, changePct: null };
      }
    })
  );

  return results;
}
