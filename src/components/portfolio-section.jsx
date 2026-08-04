"use client";

import { useState } from "react";
import Link from "next/link";
import { buyPositionAction, removePositionAction } from "@/lib/actions/portfolio";
import { IconX } from "@/components/icons";
import { Tooltip } from "@/components/tooltip";
import { TickerAutocomplete } from "@/components/ticker-autocomplete";
import { Sparkline } from "@/components/sparkline";
import { StockLogo } from "@/components/stock-logo";
import { SortHeader, compareRows } from "@/components/sort-header";

export function PortfolioSection({
  positions,
  quotes,
  historyByTicker = {},
  showViewAllLink = false,
  showBuyForm = true,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(-1);
  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => -d);
    } else {
      setSortKey(key);
      // Defaults to highest-first, that's what "sort by P/L" usually means, not lowest-first.
      setSortDir(-1);
    }
  };

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
      name: quote?.name ?? p.ticker,
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
  const totalToday = rows.reduce((sum, r) => sum + (r.todayChange ?? 0), 0);
  const totalTodayUp = totalToday >= 0;
  const totalTodayBase = totalValue - totalToday;
  const totalTodayPct = totalTodayBase ? (totalToday / totalTodayBase) * 100 : 0;
  const sortedRows = sortKey ? [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir)) : rows;

  return (
    <div className="mb-12">
      {showBuyForm && (
        <div className="mb-8">
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
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <p className="font-display text-2xl font-bold tracking-tight">Your portfolio</p>
          {positions.length > 0 && (
            <Tooltip text="Price is per share right now, Today is just today's move, P/L is the total gain or loss versus your average cost. A .NE ticker is a CDR, a CAD-hedged Canadian version of a US stock." />
          )}
        </div>
        {showViewAllLink && (
          <Link href="/portfolio" className="text-sm text-discord hover:underline">
            View all &rarr;
          </Link>
        )}
      </div>

      {positions.length > 0 && (
        <p className="font-mono text-sm mb-5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {positions.length} holding{positions.length === 1 ? "" : "s"} &middot; ${totalValue.toFixed(2)} total
          </span>
          <span className={totalTodayUp ? "text-gain" : "text-loss"}>
            &middot; today {totalTodayUp ? "+" : ""}
            {totalToday.toFixed(2)} ({totalTodayUp ? "+" : ""}
            {totalTodayPct.toFixed(2)}%)
          </span>
          <span className={totalPlUp ? "text-gain" : "text-loss"}>
            &middot; all-time {totalPlUp ? "+" : ""}
            {totalPl.toFixed(2)} ({totalPlUp ? "+" : ""}
            {totalCost ? ((totalPl / totalCost) * 100).toFixed(1) : "0.0"}%)
          </span>
        </p>
      )}

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
            <div className="grid grid-cols-[1fr_70px_90px_90px_100px_100px] items-center gap-3 sm:gap-4 flex-1 px-4 sm:px-5">
              <SortHeader label="Name" sortKey="name" active={sortKey === "name"} dir={sortDir} onClick={handleSort} />
              <span />
              <SortHeader label="Price" sortKey="price" active={sortKey === "price"} dir={sortDir} onClick={handleSort} />
              <SortHeader
                label="Today"
                sortKey="todayChangePct"
                active={sortKey === "todayChangePct"}
                dir={sortDir}
                onClick={handleSort}
              />
              <SortHeader label="Value" sortKey="value" active={sortKey === "value"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="P/L" sortKey="plPct" active={sortKey === "plPct"} dir={sortDir} onClick={handleSort} />
            </div>
            <div className="w-7 ml-1 sm:ml-2" />
          </div>
          {sortedRows.map((row) => {
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
              <div key={row.ticker} className="flex items-center glass rounded-lg pr-2 sm:pr-4 hover:border-discord transition-colors">
                  <Link
                    href={`/ticker/${encodeURIComponent(row.ticker)}`}
                    className="grid grid-cols-[1fr_84px] sm:grid-cols-[1fr_70px_90px_90px_100px_100px] items-center gap-3 sm:gap-4 flex-1 px-4 sm:px-5 py-3 sm:py-4"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      {/* Fixed slot, not just the logo: keeps names aligned even when a ticker has no logo. */}
                      <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                        <StockLogo ticker={row.ticker} size={28} />
                      </div>
                      <div className="min-w-0 shrink-0">
                        <p className="font-semibold truncate">{row.name}</p>
                        <p className="font-mono text-xs text-text-muted truncate">{row.ticker}</p>
                      </div>
                      <p className="text-xs text-warm font-semibold whitespace-nowrap truncate">
                        {row.shares.toLocaleString()} sh @ ${row.cost_basis.toFixed(2)} avg
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <Sparkline points={historyByTicker[row.ticker]} up={up} width={64} height={24} />
                    </div>
                    <span className="hidden sm:inline font-mono text-sm text-right">${row.price.toFixed(2)}</span>
                    <div className={`hidden sm:block text-right font-mono ${todayUp ? "text-gain" : "text-loss"}`}>
                      <p className="text-sm">{todayText}</p>
                      <p className="text-xs opacity-80">{todayDollarText || "—"}</p>
                    </div>
                    <span className="hidden sm:inline font-mono text-sm text-right">${row.value.toFixed(2)}</span>
                    <div className={`hidden sm:block text-right font-mono ${up ? "text-gain" : "text-loss"}`}>
                      <p className="text-sm">{pctText}</p>
                      <p className="text-xs opacity-80">{dollarText}</p>
                    </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
