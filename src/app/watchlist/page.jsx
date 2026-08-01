import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getWatchlist } from "@/lib/data/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getHistory } from "@/lib/market/yahoo";
import { getMarketMovers } from "@/lib/market/discover";
import { GUILD_ID } from "@/lib/config";
import { AppNav } from "@/components/app-nav";
import { GradientBlobs } from "@/components/gradient-blobs";
import { WatchlistCard } from "@/components/watchlist-card";
import { MarketMovers } from "@/components/market-movers";
import { addWatchlistTicker } from "@/lib/actions/watchlist";

export default async function WatchlistPage() {
  const { discordId } = await getDiscordUser();
  const tickers = await getWatchlist(GUILD_ID, discordId);

  const [quotes, histories, marketMovers] = await Promise.all([
    getQuotes(tickers),
    // A longer 3-month window here (vs. the dashboard's quick 1-month glance), this is
    // the dedicated page, more detail is the whole point of coming here specifically.
    Promise.all(tickers.map((ticker) => getHistory(ticker, "3mo"))),
    getMarketMovers(),
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
          <div className="grid gap-5 sm:grid-cols-2 mb-12">
            {tickers.map((ticker, i) => (
              <WatchlistCard
                key={ticker}
                ticker={ticker}
                quote={quoteByTicker[ticker]}
                history={historyByTicker[ticker]}
                index={i}
                large
              />
            ))}
          </div>
        )}

        <MarketMovers data={marketMovers} />
      </main>
    </div>
  );
}
