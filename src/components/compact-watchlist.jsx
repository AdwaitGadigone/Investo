"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkline } from "@/components/sparkline";
import { IconX } from "@/components/icons";
import { removeWatchlistTicker } from "@/lib/actions/watchlist";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
  { key: "ytd", label: "YTD" },
  { key: "year", label: "Year" },
  { key: "fiveYear", label: "5Y" },
];

// Dense dashboard row version of the big /watchlist cards, same data, denser layout.
export function CompactWatchlist({ tickers, quoteByTicker, historyByTicker, periodChangesByTicker }) {
  const [period, setPeriod] = useState("day");

  return (
    <div>
      <div className="flex justify-end mb-3">
        <div className="flex items-center gap-1 glass rounded-full p-1 max-w-full overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
            >
              {period === p.key && (
                <motion.span
                  layoutId="compact-watchlist-pill"
                  className="absolute inset-0 bg-discord rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className={period === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-lg divide-y divide-border">
        {/* One header row, not a caption per number per row, so it reads as a table. */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_80px_84px_84px_24px] gap-2 sm:gap-4 px-3 sm:px-4 py-2">
          <span />
          <span />
          <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">Price</span>
          <span className="text-[10px] uppercase tracking-wide text-text-muted text-right col-span-2">Change</span>
          <span />
        </div>
        {tickers.map((ticker) => {
          const quote = quoteByTicker[ticker];
          const periodChange = period === "day" ? null : periodChangesByTicker?.[ticker]?.[period];
          const pct = period === "day" ? quote?.changePct : periodChange?.pct;
          const amount = period === "day" ? quote?.change : periodChange?.amount;
          const up = pct != null && pct >= 0;
          const pctText = pct != null ? `${up ? "+" : ""}${pct.toFixed(2)}%` : "—";
          const dollarText = amount != null ? `${up ? "+" : "-"}$${Math.abs(amount).toFixed(2)}` : "";

          return (
            <div
              key={ticker}
              className="grid grid-cols-[1fr_66px_78px_20px] sm:grid-cols-[60px_1fr_80px_84px_84px_24px] items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-white/[0.03] transition-colors"
            >
              <Link href={`/ticker/${encodeURIComponent(ticker)}`} className="contents">
                <span className="font-mono font-semibold text-sm truncate">{ticker}</span>
                <div className="hidden sm:block">
                  <Sparkline points={historyByTicker[ticker]} up={up} width={64} height={24} />
                </div>
                <span className="font-mono text-sm text-right">
                  {quote?.price != null ? `$${quote.price.toFixed(2)}` : "—"}
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
