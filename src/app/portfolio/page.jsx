import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getPortfolio } from "@/lib/data/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getHistory } from "@/lib/market/yahoo";
import { getPortfolioHistory } from "@/lib/market/portfolio-history";
import { GUILD_ID } from "@/lib/config";
import { AppNav } from "@/components/app-nav";
import { Footer } from "@/components/footer";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Reveal } from "@/components/reveal";
import { Tooltip } from "@/components/tooltip";
import { PriceChart } from "@/components/price-chart";
import { PortfolioRangeSelector } from "@/components/portfolio-range-selector";
import { PortfolioSection } from "@/components/portfolio-section";
import { AnimatedNumber } from "@/components/animated-number";

export default async function PortfolioPage({ searchParams }) {
  const { range = "3mo" } = await searchParams;
  const { discordId } = await getDiscordUser();

  const positions = await getPortfolio(GUILD_ID, discordId);
  const tickers = positions.map((p) => p.ticker);

  const [quotes, history, tickerHistories] = await Promise.all([
    getQuotes(tickers),
    getPortfolioHistory(positions, range),
    Promise.all(tickers.map((ticker) => getHistory(ticker, "1mo"))),
  ]);
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));
  const historyByTicker = Object.fromEntries(tickers.map((ticker, i) => [ticker, tickerHistories[i]]));

  let totalValue = 0;
  let totalCost = 0;
  let dayChange = 0;
  for (const p of positions) {
    const quote = quoteByTicker[p.ticker];
    const price = quote?.price ?? p.cost_basis;
    totalValue += p.shares * price;
    totalCost += p.shares * p.cost_basis;
    if (quote?.change != null) dayChange += quote.change * p.shares;
  }
  const totalPl = totalValue - totalCost;
  const totalPlUp = totalPl >= 0;
  const dayChangeUp = dayChange >= 0;
  const dayChangePct = totalValue - dayChange !== 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="features" />

        <p className="font-mono text-xs uppercase tracking-widest text-cool mb-3">
          Portfolio
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-8">
          Your positions.
        </h1>

        {positions.length > 0 && (
          <Reveal className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="glass rounded-lg p-5">
              <p className="text-xs text-text-muted mb-1">Total value</p>
              <p className="font-mono text-2xl font-bold">
                <AnimatedNumber value={totalValue} prefix="$" />
              </p>
            </div>
            <div className="glass rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-text-muted">Today's return</p>
                <Tooltip text="How much your positions moved today, based on each holding's live price change" />
              </div>
              <p className={`font-mono text-2xl font-bold ${dayChangeUp ? "text-gain" : "text-loss"}`}>
                {dayChangeUp ? "+" : ""}
                <AnimatedNumber value={dayChange} prefix="$" /> ({dayChangeUp ? "+" : ""}
                {dayChangePct.toFixed(2)}%)
              </p>
            </div>
            <div className="glass rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-text-muted">All-time return</p>
                <Tooltip text="Total profit or loss versus your average cost across every position" />
              </div>
              <p className={`font-mono text-2xl font-bold ${totalPlUp ? "text-gain" : "text-loss"}`}>
                {totalPlUp ? "+" : ""}
                <AnimatedNumber value={totalPl} prefix="$" /> ({totalPlUp ? "+" : ""}
                {totalCost ? ((totalPl / totalCost) * 100).toFixed(1) : "0.0"}%)
              </p>
            </div>
          </Reveal>
        )}

        {positions.length > 0 && (
          <Reveal delay={0.05} className="mb-12">
            <div className="flex justify-end mb-3">
              <PortfolioRangeSelector active={range} />
            </div>
            <div className="glass rounded-lg p-4">
              {history.length > 1 ? (
                <PriceChart data={history} up={totalPlUp} />
              ) : (
                <p className="text-text-muted text-sm py-24 text-center">
                  Not enough price history yet to chart this range.
                </p>
              )}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Approximate: shows what your current holdings would have been worth on each
              past date, not a full buy/sell timeline.
            </p>
          </Reveal>
        )}

        <PortfolioSection positions={positions} quotes={quotes} historyByTicker={historyByTicker} />
      </main>
      <Footer />
    </div>
  );
}
