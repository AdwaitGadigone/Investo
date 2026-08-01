import Link from "next/link";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getWatchlist, getPortfolio, getActiveAlerts, isDigestEnabled } from "@/lib/data/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getHistory, getMarketSnapshot, getCommodities } from "@/lib/market/yahoo";
import { getTopPerformers, getMarketMovers, getPeriodChanges } from "@/lib/market/discover";
import { GUILD_ID } from "@/lib/config";
import { AppNav } from "@/components/app-nav";
import { SearchBar } from "@/components/search-bar";
import { MarketSnapshot } from "@/components/market-snapshot";
import { CompactWatchlist } from "@/components/compact-watchlist";
import { PortfolioSection } from "@/components/portfolio-section";
import { SuggestedStocks } from "@/components/suggested-stocks";
import { TopPerformers } from "@/components/top-performers";
import { MarketMovers } from "@/components/market-movers";
import { CommoditiesStrip } from "@/components/commodities-strip";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Tooltip } from "@/components/tooltip";
import { GettingStarted } from "@/components/getting-started";

// Same Supabase tables the bot writes to, this is what proves "same account, everywhere."
export default async function DashboardPage() {
  const { discordId, username } = await getDiscordUser();

  const [watchlist, portfolio, alerts, digestOn, topPerformers, marketSnapshot, marketMovers, commodities] =
    await Promise.all([
      getWatchlist(GUILD_ID, discordId),
      getPortfolio(GUILD_ID, discordId),
      getActiveAlerts(GUILD_ID, discordId),
      isDigestEnabled(GUILD_ID, discordId),
      getTopPerformers(),
      getMarketSnapshot(),
      getMarketMovers(),
      getCommodities(),
    ]);

  const portfolioTickers = portfolio.map((p) => p.ticker);
  const allTickers = [...new Set([...watchlist, ...portfolioTickers])];

  const [quotes, histories, portfolioHistories, periodChangesByTicker] = await Promise.all([
    getQuotes(allTickers),
    Promise.all(watchlist.map((ticker) => getHistory(ticker, "1mo"))),
    Promise.all(portfolioTickers.map((ticker) => getHistory(ticker, "1mo"))),
    getPeriodChanges(watchlist),
  ]);
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));
  const historyByTicker = Object.fromEntries(watchlist.map((ticker, i) => [ticker, histories[i]]));
  const portfolioHistoryByTicker = Object.fromEntries(
    portfolioTickers.map((ticker, i) => [ticker, portfolioHistories[i]])
  );

  const watchlistChanges = watchlist
    .map((t) => quoteByTicker[t]?.changePct)
    .filter((v) => v != null);
  const avgWatchlistChange = watchlistChanges.length
    ? watchlistChanges.reduce((a, b) => a + b, 0) / watchlistChanges.length
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="steps" />

        <p className="font-mono text-xs uppercase tracking-widest text-warm mb-3">
          Dashboard
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Welcome back, {username}.
        </h1>

        <MarketSnapshot indices={marketSnapshot} />

        <SearchBar className="max-w-xl mb-12" />

        {watchlist.length === 0 && portfolio.length === 0 && <GettingStarted />}

        <PortfolioSection
          positions={portfolio}
          quotes={quotes}
          historyByTicker={portfolioHistoryByTicker}
          showViewAllLink
          showBuyForm={false}
        />

        <MarketMovers data={marketMovers} />

        {/* Side by side so neither dense list wastes horizontal space. */}
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
              <p className="font-display text-2xl font-bold tracking-tight">Your watchlist</p>
              <div className="flex items-center gap-4">
                {avgWatchlistChange != null && (
                  <p className={`font-mono text-sm ${avgWatchlistChange >= 0 ? "text-gain" : "text-loss"}`}>
                    {avgWatchlistChange >= 0 ? "+" : ""}
                    {avgWatchlistChange.toFixed(2)}% average today
                  </p>
                )}
                <Link href="/watchlist" className="text-sm text-discord hover:underline">
                  View all &rarr;
                </Link>
              </div>
            </div>

            {watchlist.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-text-muted mb-1">Nothing on your watchlist yet.</p>
                <p className="text-sm text-text-muted">
                  Search above, tap a suggestion below, or use{" "}
                  <code className="font-mono text-warm">/watchlist add</code> in Discord.
                </p>
              </div>
            ) : (
              <CompactWatchlist
                tickers={watchlist}
                quoteByTicker={quoteByTicker}
                historyByTicker={historyByTicker}
                periodChangesByTicker={periodChangesByTicker}
              />
            )}
          </div>

          <TopPerformers data={topPerformers} compact className="mb-0" />
        </div>

        <SuggestedStocks exclude={watchlist} />

        <CommoditiesStrip commodities={commodities} />

        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted border-t border-border pt-6">
          <span>
            <span className="font-mono text-gain font-semibold">{alerts.length}</span> active price{" "}
            {alerts.length === 1 ? "alert" : "alerts"}
          </span>
          <span className="text-border">&middot;</span>
          <span className="flex items-center gap-1.5">
            Daily digest DM:{" "}
            <span className={digestOn ? "text-cool font-semibold" : "font-semibold"}>
              {digestOn ? "On" : "Off"}
            </span>
            <Tooltip text="Toggle with /digest in Discord, DMs a morning summary of your watchlist" />
          </span>
        </div>
      </main>
    </div>
  );
}
