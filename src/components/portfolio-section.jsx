import Link from "next/link";
import { buyPositionAction, removePositionAction } from "@/lib/actions/portfolio";
import { IconX } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Tooltip } from "@/components/tooltip";
import { TickerAutocomplete } from "@/components/ticker-autocomplete";
import { Sparkline } from "@/components/sparkline";

export function PortfolioSection({
  positions,
  quotes,
  historyByTicker = {},
  showViewAllLink = false,
  showBuyForm = true,
}) {
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));

  let totalValue = 0;
  let totalCost = 0;
  const rows = positions.map((p) => {
    const quote = quoteByTicker[p.ticker];
    const price = quote?.price ?? p.cost_basis;
    const value = p.shares * price;
    const cost = p.shares * p.cost_basis;
    totalValue += value;
    totalCost += cost;
    return {
      ...p,
      price,
      value,
      pl: value - cost,
      plPct: cost ? ((value - cost) / cost) * 100 : 0,
      // Today's move on the position, separate from the all-time P/L versus cost basis.
      todayChangePct: quote?.changePct ?? null,
      todayChange: quote?.change != null ? quote.change * p.shares : null,
    };
  });
  const totalPl = totalValue - totalCost;
  const totalPlUp = totalPl >= 0;

  return (
    <div className="mb-12">
      {showBuyForm && (
        <Reveal className="mb-8">
          <p className="font-display text-xl font-bold tracking-tight mb-3">Add to portfolio</p>
          <form action={buyPositionAction} className="flex flex-wrap gap-3 glass rounded-lg p-4">
            <TickerAutocomplete
              name="ticker"
              placeholder="Ticker"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 font-mono uppercase text-sm placeholder:font-sans placeholder:normal-case placeholder:text-text-muted/60 focus:outline-none focus:border-discord transition-colors"
            />
            <input
              type="number"
              step="any"
              name="shares"
              placeholder="Shares"
              required
              className="w-28 bg-bg border border-border rounded-md px-3 py-2 font-mono text-sm placeholder:font-sans placeholder:text-text-muted/60 focus:outline-none focus:border-discord transition-colors"
            />
            <input
              type="number"
              step="any"
              name="price"
              placeholder="Price paid"
              required
              className="w-32 bg-bg border border-border rounded-md px-3 py-2 font-mono text-sm placeholder:font-sans placeholder:text-text-muted/60 focus:outline-none focus:border-discord transition-colors"
            />
            <button
              type="submit"
              className="bg-discord text-white font-semibold px-5 py-2 rounded-md hover:bg-discord-hover transition-colors text-sm"
            >
              Log buy
            </button>
          </form>
        </Reveal>
      )}

      <Reveal className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <p className="font-display text-2xl font-bold tracking-tight">Your portfolio</p>
          {positions.length > 0 && (
            <Tooltip text="Price is per share right now, Today is just today's move, P/L is the total gain or loss versus your average cost" />
          )}
        </div>
        <div className="flex items-center gap-4">
          {positions.length > 0 && (
            <p className="font-mono text-sm">
              ${totalValue.toFixed(2)} total{" "}
              <span className={totalPlUp ? "text-gain" : "text-loss"}>
                &middot; {totalPlUp ? "+" : ""}
                {totalPl.toFixed(2)} P/L ({totalPlUp ? "+" : ""}
                {totalCost ? ((totalPl / totalCost) * 100).toFixed(1) : "0.0"}%)
              </span>
            </p>
          )}
          {showViewAllLink && (
            <Link href="/portfolio" className="text-sm text-discord hover:underline">
              View all &rarr;
            </Link>
          )}
        </div>
      </Reveal>

      {positions.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-text-muted mb-1">No positions yet.</p>
          <p className="text-sm text-text-muted">
            {showBuyForm ? (
              <>Log your first buy above, or use <code className="font-mono text-warm">/portfolio buy</code> in Discord.</>
            ) : (
              <>
                Log one on the{" "}
                <Link href="/portfolio" className="text-discord hover:underline">
                  Portfolio page
                </Link>
                , or use <code className="font-mono text-warm">/portfolio buy</code> in Discord.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {/* Mirrors the row's exact structure (same outer padding + trailing button-width spacer) so columns actually line up. */}
          <div className="hidden sm:flex items-center pr-2 sm:pr-4">
            <div className="grid grid-cols-[1fr_70px_90px_90px_90px_100px_90px_100px] items-center gap-3 sm:gap-4 flex-1 px-4 sm:px-5">
              <span />
              <span />
              <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">Price</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">Today %</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">Today $</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">Value</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">P/L %</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">P/L $</span>
            </div>
            <div className="w-7 ml-1 sm:ml-2" />
          </div>
          {rows.map((row, i) => {
            const up = row.pl >= 0;
            const pctText = `${up ? "+" : ""}${row.plPct.toFixed(1)}%`;
            const dollarText = `${up ? "+" : ""}$${row.pl.toFixed(2)}`;
            const todayUp = row.todayChangePct != null && row.todayChangePct >= 0;
            const todayText =
              row.todayChangePct != null
                ? `${todayUp ? "+" : ""}${row.todayChangePct.toFixed(2)}%`
                : "—";
            const todayDollarText =
              row.todayChange != null ? `${todayUp ? "+" : ""}$${row.todayChange.toFixed(2)}` : "";
            return (
              <Reveal key={row.ticker} delay={Math.min(i * 0.05, 0.3)}>
                <div className="flex items-center glass rounded-lg pr-2 sm:pr-4 hover:border-discord transition-colors">
                  <Link
                    href={`/ticker/${encodeURIComponent(row.ticker)}`}
                    className="grid grid-cols-[1fr_84px] sm:grid-cols-[1fr_70px_90px_90px_90px_100px_90px_100px] items-center gap-3 sm:gap-4 flex-1 px-4 sm:px-5 py-3 sm:py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-semibold">{row.ticker}</p>
                      <p className="text-xs text-text-muted truncate">
                        {row.shares.toLocaleString()} sh @ ${row.cost_basis.toFixed(2)} avg
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <Sparkline points={historyByTicker[row.ticker]} up={up} width={64} height={24} />
                    </div>
                    <span className="hidden sm:inline font-mono text-sm text-right">${row.price.toFixed(2)}</span>
                    <span className={`hidden sm:inline font-mono text-sm text-right ${todayUp ? "text-gain" : "text-loss"}`}>
                      {todayText}
                    </span>
                    <span className={`hidden sm:inline font-mono text-sm text-right ${todayUp ? "text-gain" : "text-loss"}`}>
                      {todayDollarText || "—"}
                    </span>
                    <span className="hidden sm:inline font-mono text-sm text-right">${row.value.toFixed(2)}</span>
                    <span className={`hidden sm:inline font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                      {pctText}
                    </span>
                    <span className={`hidden sm:inline font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                      {dollarText}
                    </span>
                    <span className={`sm:hidden font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
                      ${row.value.toFixed(2)}
                      <br />
                      {pctText} P/L
                    </span>
                  </Link>
                  <form action={removePositionAction} className="ml-1 sm:ml-2">
                    <input type="hidden" name="ticker" value={row.ticker} />
                    <button
                      type="submit"
                      className="text-text-muted hover:text-loss w-7 h-7 flex items-center justify-center rounded-full hover:bg-loss/10 transition-colors"
                      aria-label={`Close ${row.ticker} position`}
                    >
                      <IconX width={14} height={14} />
                    </button>
                  </form>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
