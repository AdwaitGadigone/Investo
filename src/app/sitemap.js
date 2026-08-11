import { getPopularTickers } from "@/lib/market/discover";
import { CDRS } from "@/lib/market/cdrs";
import { CRYPTOS } from "@/lib/market/crypto-config";
import { COMMODITIES } from "@/lib/market/commodities-config";

// Marketing pages plus every ticker page that's actually public now (dashboard/ticker/commodities no longer
// require login), Google can't index a page it doesn't know exists. Ticker pages get a lower priority/less
// frequent crawl hint than the marketing pages, there are dozens of them and their content changes by the
// minute anyway, a crawler re-checking hourly wouldn't catch that either way.
export default async function sitemap() {
  const base = "https://investoweb.vercel.app";
  const now = new Date();

  const staticPages = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/bot`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Reuses the same cached screener call the dashboard's "Top performers" already triggers, not a fresh fetch.
  const popular = await getPopularTickers().catch(() => []);
  const tickerSymbols = [
    ...new Set([...popular.map((t) => t.ticker), ...CDRS.map((c) => c.ticker), ...CRYPTOS.map((c) => c.ticker)]),
  ];

  const tickerPages = tickerSymbols.map((ticker) => ({
    url: `${base}/ticker/${encodeURIComponent(ticker)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  const commodityPages = COMMODITIES.map((c) => ({
    url: `${base}/commodities/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.4,
  }));

  return [...staticPages, ...tickerPages, ...commodityPages];
}
