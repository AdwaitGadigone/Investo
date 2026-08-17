import Link from "next/link";
import { getOptionalDiscordUser } from "@/lib/auth/get-discord-user";
import { getWatchlist, getPortfolio, getActiveAlerts, isDigestEnabled } from "@/lib/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getHistory, getMarketSnapshot, getCommodities } from "@/lib/market/yahoo";
import { getTopPerformers, getMarketMovers, getPeriodChanges } from "@/lib/market/discover";
import { CRYPTOS } from "@/lib/market/crypto-config";
import { peekActiveGuildId } from "@/lib/auth/active-guild";
import { AppNav } from "@/components/app-nav";
import { SearchBar } from "@/components/search-bar";
import { MarketSnapshot } from "@/components/market-snapshot";
import { CompactWatchlist } from "@/components/compact-watchlist";
import { PortfolioSection } from "@/components/portfolio-section";
import { SuggestedStocks } from "@/components/suggested-stocks";
import { TopPerformers } from "@/components/top-performers";
import { MarketMovers } from "@/components/market-movers";
import { CommoditiesStrip } from "@/components/commodities-strip";
import { CryptoStrip } from "@/components/crypto-strip";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Tooltip } from "@/components/tooltip";
import { GettingStarted } from "@/components/getting-started";
import { SignInPrompt } from "@/components/sign-in-prompt";

// Same Supabase tables the bot writes to, this is what proves "same account, everywhere."
// Public for anyone to browse (market data needs no guild at all), personal sections degrade to a
// sign-in prompt when logged out instead of the page requiring auth to load at all.
export default async function DashboardPage() {
  const user = await getOptionalDiscordUser();
  // peek, not the redirecting getActiveGuildId, a logged-in user with no guild cookie yet (a rare
  // edge case, normally set at login) should fall back to the guest view here, not force a redirect.
  const guildId = user ? await peekActiveGuildId() : null;
  const isPersonalized = Boolean(user && guildId);

  const [watchlist, portfolio, alerts, digestOn, topPerformers, marketSnapshot, marketMovers, commodities] =
    await Promise.all([
      isPersonalized ? getWatchlist(guildId, user.discordId) : Promise.resolve([]),
      isPersonalized ? getPortfolio(guildId, user.discordId) : Promise.resolve([]),
      isPersonalized ? getActiveAlerts(guildId, user.discordId) : Promise.resolve([]),
      isPersonalized ? isDigestEnabled(guildId, user.discordId) : Promise.resolve(false),
      getTopPerformers(),
      getMarketSnapshot(),
      getMarketMovers(),
      getCommodities(),
    ]);

  const portfolioTickers = portfolio.map((p) => p.ticker);
  const allTickers = [...new Set([...watchlist, ...portfolioTickers])];
  const commodityTickers = commodities.map((c) => c.ticker);
  const cryptoTickers = CRYPTOS.map((c) => c.ticker);

  // One history fetch per unique ticker, not per list, so a ticker in both watchlist and portfolio isn't fetched twice.
  const [quotes, allHistories, periodChangesByTicker, commodityPeriodChanges, cryptoQuotes, cryptoPeriodChanges] =
    await Promise.all([
      getQuotes(allTickers),
      // CDRs trade thin enough that 1mo has almost no real data to plot, verified directly, 1y does.
      Promise.all(allTickers.map((ticker) => getHistory(ticker, ticker.endsWith(".NE") ? "1y" : "1mo"))),
      getPeriodChanges(watchlist),
      getPeriodChanges(commodityTickers),
      getQuotes(cryptoTickers),
      getPeriodChanges(cryptoTickers),
    ]);
  const cryptoByTicker = Object.fromEntries(cryptoQuotes.map((q) => [q.ticker, q]));
  const cryptoRows = CRYPTOS.map((c) => ({ ...c, ...cryptoByTicker[c.ticker] }));
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));
  const historyByTicker = Object.fromEntries(allTickers.map((ticker, i) => [ticker, allHistories[i]]));
  const portfolioHistoryByTicker = historyByTicker;

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

        {/* Anchored to this header block specifically, not the whole page, so it can never drift down
            into Market Movers or lower sections on a shorter viewport. */}
        <div className="relative">
          <img
            src="/investo-logo.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-full -mt-25 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-10 w-72 md:w-96 opacity-[0.06] -z-10"
          />

          <p className="font-mono text-xs uppercase tracking-widest text-warm mb-3">
            Dashboard
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {user ? `Welcome back, ${user.username}.` : "See what's moving, right now."}
          </h1>
        </div>

        <MarketSnapshot indices={marketSnapshot} />

        <SearchBar className="max-w-xl mb-12" />

        {isPersonalized && watchlist.length === 0 && portfolio.length === 0 && <GettingStarted />}

        <MarketMovers data={marketMovers} />

        <div className="border-t border-border/60 mb-12" />

        {/* Side by side so neither block wastes horizontal space. */}
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <TopPerformers data={topPerformers} compact className="mb-0" />
          <CommoditiesStrip commodities={commodities} periodChangesByTicker={commodityPeriodChanges} className="mb-0" />
        </div>

        {/* Its own row, not mixed into the stock lists above, crypto and stocks are different enough to browse separately. */}
        <CryptoStrip quotes={cryptoRows} periodChangesByTicker={cryptoPeriodChanges} />

        <div className="border-t border-border/60 mb-12" />

        {/* Side by side so neither dense list wastes horizontal space. */}
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div>
            <div className="mb-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-display text-2xl font-bold tracking-tight">Your watchlist</p>
                <Link href="/watchlist" className="text-sm text-discord hover:underline">
                  View all &rarr;
                </Link>
              </div>
              {avgWatchlistChange != null && (
                <p className={`font-mono text-sm mt-1 ${avgWatchlistChange >= 0 ? "text-gain" : "text-loss"}`}>
                  {avgWatchlistChange >= 0 ? "+" : ""}
                  {avgWatchlistChange.toFixed(2)}% average today
                </p>
              )}
            </div>

            {!isPersonalized ? (
              <SignInPrompt
                title="Sign in to build a watchlist."
                body="Track any stock or crypto and see it here, and in Discord, instantly."
              />
            ) : watchlist.length === 0 ? (
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

            <SuggestedStocks exclude={watchlist} className="mt-8 mb-0" />
          </div>

          {!isPersonalized ? (
            <div>
              <p className="font-display text-2xl font-bold tracking-tight mb-5">Your portfolio</p>
              <SignInPrompt
                title="Sign in to track a portfolio."
                body="Log real positions and see live profit and loss, not just price movement."
              />
            </div>
          ) : (
            <PortfolioSection
              positions={portfolio}
              quotes={quotes}
              historyByTicker={portfolioHistoryByTicker}
              showViewAllLink
              showBuyForm={false}
              showRemoveButton={false}
              collapsedCount={5}
            />
          )}
        </div>

        {!isPersonalized ? (
          <div className="text-sm text-text-muted border-t border-border pt-6">
            <Link href="/login" className="text-discord hover:underline font-semibold">
              Sign in
            </Link>{" "}
            to set price alerts and a daily digest DM.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted border-t border-border pt-6">
            <Link href="/alerts" className="hover:text-text transition-colors">
              <span className="font-mono text-gain font-semibold">{alerts.length}</span> active price{" "}
              {alerts.length === 1 ? "alert" : "alerts"}
            </Link>
            <span className="text-border">&middot;</span>
            <span className="flex items-center gap-1.5">
              Daily digest DM:{" "}
              <span className={digestOn ? "text-cool font-semibold" : "font-semibold"}>
                {digestOn ? "On" : "Off"}
              </span>
              <Tooltip text="Toggle with /digest in Discord, DMs a morning summary of your watchlist" />
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
