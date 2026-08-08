import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getWatchlist } from "@/lib/data/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getHistory } from "@/lib/market/yahoo";
import { getMarketMovers, getPeriodChanges } from "@/lib/market/discover";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { AppNav } from "@/components/app-nav";
import { GradientBlobs } from "@/components/gradient-blobs";
import { WatchlistGrid } from "@/components/watchlist-grid";
import { MarketMovers } from "@/components/market-movers";
import { addWatchlistTicker } from "@/lib/actions/watchlist";

export default async function WatchlistPage() {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const tickers = await getWatchlist(guildId, discordId);

  const [quotes, histories, marketMovers, periodChangesByTicker] = await Promise.all([
    getQuotes(tickers),
    // 3 months here, vs. the dashboard's 1-month glance, more detail is the point of this page.
    Promise.all(tickers.map((ticker) => getHistory(ticker, "3mo"))),
    getMarketMovers(),
    getPeriodChanges(tickers),
  ]);
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));
  const historyByTicker = Object.fromEntries(tickers.map((ticker, i) => [ticker, histories[i]]));

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="features" />

        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-discord mb-3">
            Watchlist
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Your watchlist.
          </h1>
          <p className="text-text-muted mb-10">
            Same list as <code className="font-mono text-warm">/watchlist</code> in Discord,
            adding or removing here shows up there instantly, and the other way around.
          </p>

          <form action={addWatchlistTicker} className="flex gap-3 mb-12">
            <input
              type="text"
              name="ticker"
              placeholder="AAPL"
              required
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 font-mono uppercase placeholder:text-text-muted/50 focus:outline-none focus:border-discord transition-colors"
            />
            <button
              type="submit"
              className="bg-discord text-white font-semibold px-6 py-3 rounded-lg hover:bg-discord-hover transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {tickers.length === 0 ? (
          <p className="text-text-muted mb-12">
            Nothing here yet, add a ticker above or with{" "}
            <code className="font-mono text-warm">/watchlist add</code> in Discord.
          </p>
        ) : (
          <WatchlistGrid
            tickers={tickers}
            quoteByTicker={quoteByTicker}
            historyByTicker={historyByTicker}
            periodChangesByTicker={periodChangesByTicker}
          />
        )}

        <MarketMovers data={marketMovers} />
      </main>
    </div>
  );
}
