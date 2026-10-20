"use client";

import { useState } from "react";
import Link from "next/link";
import { buyPositionAction, editPositionAction, removePositionAction } from "@/lib/actions/portfolio";
import { formatPrice, formatSignedPrice } from "@/lib/format-currency";
import { IconCheck, IconPencil, IconX } from "@/components/icons";
import { Tooltip } from "@/components/tooltip";
import { TickerAutocomplete } from "@/components/ticker-autocomplete";
import { Sparkline } from "@/components/sparkline";
import { StockLogo } from "@/components/stock-logo";
import { SortHeader, compareRows } from "@/components/sort-header";

export function PortfolioSection({
  positions,
  quotes,
  historyByTicker = {},
  // Currency code -> rate to USD, for the handful of positions not already in USD, so the totals below
  // are one meaningful sum instead of adding raw numbers across different currencies.
  fxRates = {},
  showViewAllLink = false,
  showBuyForm = true,
  showRemoveButton = true,
  collapsedCount = null,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const [editingTicker, setEditingTicker] = useState(null);
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

  let totalValueUsd = 0;
  let totalCostUsd = 0;
  let totalPlUsd = 0;
  let totalTodayUsd = 0;
  const rows = positions.map((p) => {
    const quote = quoteByTicker[p.ticker];
    const price = quote?.price ?? p.cost_basis;
    const currency = quote?.currency ?? "USD";
    const isShort = p.direction === "short";
    const value = p.shares * price;
    const cost = p.shares * p.cost_basis;
    // A short profits when price falls below what it was shorted at, the opposite of a long.
    const pl = isShort ? cost - value : value - cost;
    // Today's move flips sign the same way, a short loses money when the price goes up today.
    const todayChange = quote?.change != null ? quote.change * p.shares * (isShort ? -1 : 1) : null;

    // Positions can be in different listing currencies, normalized to USD before adding to one total.
    // totalPl is summed directly from each position's own correctly-signed pl, not derived from
    // totalValue - totalCost, that subtraction stops meaning anything once a short is in the mix.
    const rate = currency === "USD" ? 1 : fxRates[currency] ?? 1;
    totalValueUsd += value * rate;
    totalCostUsd += cost * rate;
    totalPlUsd += pl * rate;
    totalTodayUsd += (todayChange ?? 0) * rate;

    return {
      ...p,
      name: quote?.name ?? p.ticker,
      currency,
      isShort,
      price,
      value,
      pl,
      plPct: cost ? (pl / cost) * 100 : 0,
      // Today's move on the position, separate from the all-time P/L versus cost basis.
      todayChangePct: quote?.changePct != null ? quote.changePct * (isShort ? -1 : 1) : null,
      todayChange,
    };
  });
  // Normalized to USD above, the per-row figures stay in each position's own native currency.
  const totalPl = totalPlUsd;
  const totalPlUp = totalPl >= 0;
  const totalToday = totalTodayUsd;
  const totalTodayUp = totalToday >= 0;
  const totalTodayBase = totalValueUsd - totalToday;
  const totalTodayPct = totalTodayBase ? (totalToday / totalTodayBase) * 100 : 0;
  const totalValue = totalValueUsd;
  const totalCost = totalCostUsd;
  const sortedRows = sortKey ? [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir)) : rows;
  const canCollapse = collapsedCount != null && sortedRows.length > collapsedCount;
  const visibleRows = canCollapse && !expanded ? sortedRows.slice(0, collapsedCount) : sortedRows;

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
            <Tooltip text="Price is per share right now, Today is just today's move, P/L is the total gain or loss versus your average cost. Totals are converted to USD for positions priced in another currency. A .NE ticker is a CDR, a CAD-hedged Canadian version of a US stock, and a Short tag means P/L is inverted, it gains when the price drops." />
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
              <SortHeader
                label="Name"
                sortKey="name"
                align="start"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={handleSort}
              />
              <span />
              <SortHeader label="Price" sortKey="price" active={sortKey === "price"} dir={sortDir} onClick={handleSort} />
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-text-muted">Today</span>
                <div className="flex items-center gap-2">
                  <SortHeader label="%" sortKey="todayChangePct" active={sortKey === "todayChangePct"} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="$" sortKey="todayChange" active={sortKey === "todayChange"} dir={sortDir} onClick={handleSort} />
                </div>
              </div>
              <SortHeader label="Value" sortKey="value" active={sortKey === "value"} dir={sortDir} onClick={handleSort} />
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-text-muted">P/L</span>
                <div className="flex items-center gap-2">
                  <SortHeader label="%" sortKey="plPct" active={sortKey === "plPct"} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="$" sortKey="pl" active={sortKey === "pl"} dir={sortDir} onClick={handleSort} />
                </div>
              </div>
            </div>
            {/* Matches the row's actual pencil+X button group width so the header columns still line up. */}
            {showRemoveButton && <div className="w-[60px] ml-1 sm:ml-2" />}
          </div>
          {visibleRows.map((row) => {
            const up = row.pl >= 0;
            const pctText = `${up ? "+" : ""}${row.plPct.toFixed(1)}%`;
            const dollarText = formatSignedPrice(row.pl, row.currency);
            const todayUp = row.todayChangePct != null && row.todayChangePct >= 0;
            const todayText =
              row.todayChangePct != null
                ? `${todayUp ? "+" : ""}${row.todayChangePct.toFixed(2)}%`
                : "-";
            const todayDollarText =
              row.todayChange != null ? formatSignedPrice(row.todayChange, row.currency) : "";
            const isEditing = editingTicker === row.ticker;
            return (
              <div key={row.ticker} className="flex items-center glass rounded-lg pr-2 sm:pr-4 hover:border-discord transition-colors">
                  {isEditing ? (
                    <form
                      action={async (formData) => {
                        await editPositionAction(formData);
                        setEditingTicker(null);
                      }}
                      className="flex-1 flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 sm:py-4"
                    >
                      <input type="hidden" name="ticker" value={row.ticker} />
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                          <StockLogo ticker={row.ticker} size={28} />
                        </div>
                        <p className="font-semibold truncate">{row.ticker}</p>
                      </div>
                      <input
                        type="number"
                        step="any"
                        name="shares"
                        defaultValue={row.shares}
                        required
                        aria-label="Shares"
                        className="w-24 bg-bg border border-border rounded-md px-2 py-1.5 font-mono text-sm focus:outline-none focus:border-discord transition-colors"
                      />
                      <span className="text-text-muted text-xs shrink-0">
                        sh @ {row.currency && row.currency !== "USD" ? `${row.currency} ` : "$"}
                      </span>
                      <input
                        type="number"
                        step="any"
                        name="cost_basis"
                        defaultValue={row.cost_basis}
                        required
                        aria-label="Average cost"
                        className="w-24 bg-bg border border-border rounded-md px-2 py-1.5 font-mono text-sm focus:outline-none focus:border-discord transition-colors"
                      />
                      <span className="text-text-muted text-xs shrink-0">avg</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="submit"
                          className="text-gain hover:text-gain w-7 h-7 flex items-center justify-center rounded-full hover:bg-gain/10 transition-colors"
                          aria-label={`Save ${row.ticker}`}
                        >
                          <IconCheck width={14} height={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTicker(null)}
                          className="text-text-muted hover:text-loss w-7 h-7 flex items-center justify-center rounded-full hover:bg-loss/10 transition-colors"
                          aria-label="Cancel"
                        >
                          <IconX width={14} height={14} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <Link
                        href={`/ticker/${encodeURIComponent(row.ticker)}`}
                        className="grid grid-cols-[1fr_84px] sm:grid-cols-[1fr_70px_90px_90px_100px_100px] items-center gap-3 sm:gap-4 flex-1 px-4 sm:px-5 py-3 sm:py-4"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          {/* Fixed slot, not just the logo: keeps names aligned even when a ticker has no logo. */}
                          <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                            <StockLogo ticker={row.ticker} size={28} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">
                              {row.name}
                              {row.isShort && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-loss border border-loss/40 rounded px-1 py-0.5 align-middle">
                                  Short
                                </span>
                              )}
                            </p>
                            <p className="font-mono text-xs text-text-muted truncate">
                              {row.ticker}{" "}
                              <span className="text-warm font-semibold">
                                &middot; {row.shares.toLocaleString()} sh @ {formatPrice(row.cost_basis, row.currency)}{" "}
                                {row.isShort ? "shorted at" : "avg"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <Sparkline points={historyByTicker[row.ticker]} up={up} width={64} height={24} />
                        </div>
                        <span className="hidden sm:inline font-mono text-sm text-right">
                          {formatPrice(row.price, row.currency)}
                        </span>
                        <div className={`hidden sm:block text-right font-mono ${todayUp ? "text-gain" : "text-loss"}`}>
                          <p className="text-sm">{todayText}</p>
                          <p className="text-xs opacity-80">{todayDollarText || "-"}</p>
                        </div>
                        <span className="hidden sm:inline font-mono text-sm text-right">
                          {formatPrice(row.value, row.currency)}
                        </span>
                        <div className={`hidden sm:block text-right font-mono ${up ? "text-gain" : "text-loss"}`}>
                          <p className="text-sm">{pctText}</p>
                          <p className="text-xs opacity-80">{dollarText}</p>
                        </div>
                        <span className={`sm:hidden font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
                          {formatPrice(row.value, row.currency)}
                          <br />
                          {pctText} P/L
                        </span>
                      </Link>
                      {showRemoveButton && (
                        <div className="flex items-center gap-1 ml-1 sm:ml-2">
                          <button
                            type="button"
                            onClick={() => setEditingTicker(row.ticker)}
                            className="text-text-muted hover:text-discord w-7 h-7 flex items-center justify-center rounded-full hover:bg-discord/10 transition-colors"
                            aria-label={`Edit ${row.ticker} position`}
                          >
                            <IconPencil width={14} height={14} />
                          </button>
                          <form action={removePositionAction}>
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
                      )}
                    </>
                  )}
                </div>
            );
          })}
          {canCollapse && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-sm text-discord hover:underline text-left"
            >
              {expanded ? "Show less" : `Show all ${sortedRows.length} holdings ↓`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
