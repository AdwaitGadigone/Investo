import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getQuote, getHistory, getRelatedTickers } from "@/lib/market/yahoo";
import { getCompanyNews, getRecommendationTrends } from "@/lib/market/finnhub";
import { getWatchlist } from "@/lib/data/db";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { GUILD_ID } from "@/lib/config";
import { AppNav } from "@/components/app-nav";
import { Footer } from "@/components/footer";
import { PriceChart } from "@/components/price-chart";
import { RangeSelector } from "@/components/range-selector";
import { WatchlistToggle } from "@/components/watchlist-toggle";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Reveal } from "@/components/reveal";
import { Tooltip } from "@/components/tooltip";
import { AnalystConsensus, AnalystConsensusSkeleton } from "@/components/analyst-consensus";
import { IconChart, IconBarChart, IconWallet } from "@/components/icons";
import Link from "next/link";

// Forces a fresh fetch on every visit, no cached result can ever serve a stale 404.
export const dynamic = "force-dynamic";

// Turns something like 4897205003506 into $4.90T instead of a wall of digits.
function formatLarge(n) {
  if (n == null) return "N/A";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default async function TickerPage({ params, searchParams }) {
  const { symbol } = await params;
  const { range = "3mo" } = await searchParams;
  const ticker = symbol.toUpperCase();

  const { discordId } = await getDiscordUser();

  const [quote, history, news, trends, watchlist] = await Promise.all([
    getQuote(ticker),
    getHistory(ticker, range),
    getCompanyNews(ticker),
    getRecommendationTrends(ticker),
    getWatchlist(GUILD_ID, discordId),
  ]);

  if (!quote) notFound();

  // Only fetch related tickers once we know this one's real, no point for a 404.
  const related = await getRelatedTickers(ticker);

  const up = quote.changePct >= 0;

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-12">
        <GradientBlobs variant="features" />

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  {quote.name}
                </p>
                {(quote.exchange || quote.currency) && (
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded border border-border text-text-muted">
                    {quote.exchange}
                    {quote.exchange && quote.currency ? " · " : ""}
                    {quote.currency}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-baseline gap-4">
                <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight">
                  {quote.ticker}
                </h1>
                <span className="font-mono text-3xl">
                  {quote.currency && quote.currency !== "USD" ? `${quote.currency} ` : "$"}
                  {quote.price.toFixed(2)}
                  {quote.unit && <span className="text-lg text-text-muted"> /{quote.unit}</span>}
                </span>
              </div>
              {quote.currency && quote.currency !== "USD" && (
                <p className="text-xs text-text-muted mt-1">
                  Priced in {quote.currency}, not USD, converted amounts elsewhere on the
                  site may not match this figure directly.
                </p>
              )}
              {quote.change != null && (
                <p className={`font-mono text-lg mt-2 ${up ? "text-gain" : "text-loss"}`}>
                  {up ? "+" : ""}
                  {quote.change.toFixed(2)} ({up ? "+" : ""}
                  {quote.changePct.toFixed(2)}%) today
                </p>
              )}
            </div>

            <WatchlistToggle ticker={ticker} isWatchlisted={watchlist.includes(ticker)} />
          </div>

          <Reveal>
            <div className="flex justify-end mb-3">
              <RangeSelector ticker={ticker} active={range} />
            </div>
            <div className="glass rounded-lg p-4 mb-10">
              {history.length > 0 ? (
                <PriceChart data={history} up={up} />
              ) : (
                <p className="text-text-muted text-sm py-24 text-center">
                  No chart data available for this range.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.05} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <IconChart width={14} height={14} />
                <p className="text-xs font-semibold">Day range</p>
                <Tooltip text="The lowest and highest price this stock traded at today" />
              </div>
              <p className="font-mono text-sm">
                ${quote.dayLow?.toFixed(2)} &ndash; ${quote.dayHigh?.toFixed(2)}
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <IconChart width={14} height={14} />
                <p className="text-xs font-semibold">52 week range</p>
                <Tooltip text="The lowest and highest price over the past year" />
              </div>
              <p className="font-mono text-sm">
                ${quote.yearLow?.toFixed(2)} &ndash; ${quote.yearHigh?.toFixed(2)}
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <IconBarChart width={14} height={14} />
                <p className="text-xs font-semibold">Volume</p>
                <Tooltip text="How many shares have traded hands today, higher means more active buying and selling" />
              </div>
              <p className="font-mono text-sm">{quote.volume?.toLocaleString()}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <IconWallet width={14} height={14} />
                <p className="text-xs font-semibold">Market cap</p>
                <Tooltip text="The total value of every outstanding share, price times share count" />
              </div>
              <p className="font-mono text-sm">{formatLarge(quote.marketCap)}</p>
            </div>
          </Reveal>

          {/* Suspense streams this in separately since the Gemini call is slow. */}
          <Suspense fallback={<AnalystConsensusSkeleton />}>
            <AnalystConsensus ticker={ticker} quote={quote} trends={trends} news={news} />
          </Suspense>

          {news.length > 0 && (
            <Reveal delay={0.15}>
              <p className="font-mono text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
                Recent News
              </p>
              <div className="flex flex-col gap-3">
                {news.slice(0, 5).map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block glass rounded-lg p-4 hover:border-discord transition-colors"
                  >
                    <p className="font-medium mb-1">{article.headline}</p>
                    <p className="text-xs text-text-muted">{article.source}</p>
                  </a>
                ))}
              </div>
            </Reveal>
          )}

          {related.length > 0 && (
            <Reveal delay={0.2} className="mt-12">
              <p className="font-mono text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">
                People Also Watch
              </p>
              <div className="flex flex-wrap gap-3">
                {related.map((r) => {
                  const relUp = r.changePct >= 0;
                  return (
                    <Link
                      key={r.ticker}
                      href={`/ticker/${encodeURIComponent(r.ticker)}`}
                      className="glass rounded-lg px-4 py-3 hover:border-discord transition-colors min-w-32"
                    >
                      <p className="font-mono text-sm font-semibold">{r.ticker}</p>
                      <p className="text-xs text-text-muted truncate max-w-32">{r.name}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono text-sm">${r.price.toFixed(2)}</span>
                        {r.changePct != null && (
                          <span className={`font-mono text-xs ${relUp ? "text-gain" : "text-loss"}`}>
                            {relUp ? "+" : ""}
                            {r.changePct.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
