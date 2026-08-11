"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkline } from "@/components/sparkline";
import { StockLogo } from "@/components/stock-logo";
import { SortHeader, compareRows } from "@/components/sort-header";
import { IconX } from "@/components/icons";
import { PeriodPills } from "@/components/period-pills";
import { removeWatchlistTicker } from "@/lib/actions/watchlist";

// Dense dashboard row version of the big /watchlist cards, same data, denser layout.
export function CompactWatchlist({ tickers, quoteByTicker, historyByTicker, periodChangesByTicker }) {
  const [period, setPeriod] = useState("day");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(-1);
  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => -d);
    } else {
      setSortKey(key);
      // Defaults to highest-first, that's what "sort by change" usually means, not lowest-first.
      setSortDir(-1);
    }
  };

  const rows = tickers.map((ticker) => {
    const quote = quoteByTicker[ticker];
    const periodChange = period === "day" ? null : periodChangesByTicker?.[ticker]?.[period];
    const pct = period === "day" ? quote?.changePct : periodChange?.pct;
    const amount = period === "day" ? quote?.change : periodChange?.amount;
    return { ticker, price: quote?.price ?? null, pct, amount };
  });
  const sortedRows = sortKey ? [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir)) : rows;

  return (
    <div>
      <div className="flex justify-start mb-3">
        <PeriodPills value={period} onChange={setPeriod} layoutId="compact-watchlist-pill" />
      </div>

      <div className="glass rounded-lg divide-y divide-border">
        {/* One header row, not a caption per number per row, so it reads as a table. */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_80px_84px_84px_24px] gap-2 sm:gap-4 px-3 sm:px-4 py-2">
          <SortHeader
            label="Ticker"
            sortKey="ticker"
            align="start"
            active={sortKey === "ticker"}
            dir={sortDir}
            onClick={handleSort}
          />
          <span />
          <SortHeader label="Price" sortKey="price" active={sortKey === "price"} dir={sortDir} onClick={handleSort} />
          <SortHeader label="Change %" sortKey="pct" active={sortKey === "pct"} dir={sortDir} onClick={handleSort} />
          <SortHeader label="Change $" sortKey="amount" active={sortKey === "amount"} dir={sortDir} onClick={handleSort} />
          <span />
        </div>
        {sortedRows.map((row, i) => {
          const { ticker, price, pct, amount } = row;
          const up = pct != null && pct >= 0;
          const pctText = pct != null ? `${up ? "+" : ""}${pct.toFixed(2)}%` : "-";
          const dollarText = amount != null ? `${up ? "+" : "-"}$${Math.abs(amount).toFixed(2)}` : "";

          return (
            <div
              key={ticker}
              style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
              className="row-fade-in grid grid-cols-[1fr_66px_78px_20px] sm:grid-cols-[60px_1fr_80px_84px_84px_24px] items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-white/[0.03] transition-colors"
            >
              <Link href={`/ticker/${encodeURIComponent(ticker)}`} className="contents">
                <span className="flex items-center gap-1.5 min-w-0">
                  <StockLogo ticker={ticker} size={18} />
                  <span className="font-mono font-semibold text-sm truncate">{ticker}</span>
                </span>
                <div className="hidden sm:block">
                  <Sparkline points={historyByTicker[ticker]} up={up} width={64} height={24} />
                </div>
                <span className="font-mono text-sm text-right">
                  {price != null ? `$${price.toFixed(2)}` : "-"}
                </span>
                <span className={`hidden sm:inline font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                  {pctText}
                </span>
                <span className={`hidden sm:inline font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                  {dollarText}
                </span>
                <span className={`sm:hidden font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
                  {pctText}
                  {dollarText && <><br />{dollarText}</>}
                </span>
              </Link>
              <form action={removeWatchlistTicker} className="flex justify-end">
                <input type="hidden" name="ticker" value={ticker} />
                <button
                  type="submit"
                  className="text-text-muted hover:text-loss w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-loss/10 transition-colors"
                  aria-label={`Remove ${ticker} from watchlist`}
                >
                  <IconX width={11} height={11} />
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
