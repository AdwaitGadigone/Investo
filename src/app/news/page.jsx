import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getWatchlist, isDigestEnabled } from "@/lib/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getAggregatedNews } from "@/lib/market/finnhub";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { AppNav } from "@/components/app-nav";
import { Footer } from "@/components/footer";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Reveal } from "@/components/reveal";
import { Tooltip } from "@/components/tooltip";
import { DigestToggle } from "@/components/digest-toggle";

// The digest DM's content viewable any time, plus news aggregated across the whole watchlist.
export default async function NewsPage() {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();

  const [watchlist, digestOn] = await Promise.all([
    getWatchlist(guildId, discordId),
    isDigestEnabled(guildId, discordId),
  ]);

  const [quotes, news] = await Promise.all([
    getQuotes(watchlist),
    getAggregatedNews(watchlist),
  ]);
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="steps" />

        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-warm mb-3">
              News &amp; Digest
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              What's moving.
            </h1>
          </div>
          <DigestToggle on={digestOn} />
        </div>

        <Reveal className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <p className="font-display text-2xl font-bold tracking-tight">Your digest</p>
            <Tooltip text="The same summary the daily DM sends, viewable here any time" />
          </div>

          {watchlist.length === 0 ? (
            <p className="text-text-muted">
              Add tickers to your watchlist to see a digest here.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {watchlist.map((ticker) => {
                const quote = quoteByTicker[ticker];
                const up = quote?.changePct != null && quote.changePct >= 0;
                return (
                  <div
                    key={ticker}
                    className="flex items-center justify-between glass rounded-lg px-5 py-4"
                  >
                    <span className="font-mono font-semibold">{ticker}</span>
                    <div className="text-right">
                      {quote?.price != null && (
                        <p className="font-mono text-sm">${quote.price.toFixed(2)}</p>
                      )}
                      {quote?.changePct != null && (
                        <p className={`font-mono text-xs ${up ? "text-gain" : "text-loss"}`}>
                          {up ? "+" : ""}
                          {quote.changePct.toFixed(2)}% today
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <p className="font-display text-2xl font-bold tracking-tight mb-5">
            Recent news for your watchlist
          </p>

          {news.length === 0 ? (
            <p className="text-text-muted">
              No recent headlines for your watchlist right now.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {news.slice(0, 20).map((article) => (
                <a
                  key={`${article.ticker}-${article.id}`}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass rounded-lg p-4 hover:border-discord transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-warm font-semibold">
                      {article.ticker}
                    </span>
                    <span className="text-xs text-text-muted">{article.source}</span>
                  </div>
                  <p className="font-medium">{article.headline}</p>
                </a>
              ))}
            </div>
          )}
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
