import "server-only";

const PREVIEW_TICKERS = ["AAPL", "TSLA", "NVDA"];

// Real quotes for the landing page preview, a "live" panel with fake data isn't convincing.
export async function getPreviewQuotes() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return [];

  const results = await Promise.all(
    PREVIEW_TICKERS.map(async (ticker) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`,
          { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;

        const data = await res.json();
        if (!data.c) return null;

        return { ticker, price: data.c, changePct: data.dp };
      } catch {
        return null;
      }
    })
  );

  return results.filter((r) => r !== null);
}
