"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkline } from "@/components/sparkline";
import { StockLogo } from "@/components/stock-logo";
import { Tooltip } from "@/components/tooltip";
import { IconX } from "@/components/icons";
import { removeWatchlistTicker } from "@/lib/actions/watchlist";

export function WatchlistCard({ ticker, quote, history, index, large = false, periodChange, periodLabel = "today" }) {
  const pct = periodChange ? periodChange.pct : quote?.changePct;
  const amount = periodChange ? periodChange.amount : quote?.change;
  const up = pct != null && pct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4), ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`relative glass rounded-lg hover:border-discord transition-colors ${
        large ? "p-6" : "p-5"
      }`}
    >
      <form action={removeWatchlistTicker} className="absolute top-3 right-3 z-10">
        <input type="hidden" name="ticker" value={ticker} />
        <button
          type="submit"
          className="text-text-muted hover:text-loss w-6 h-6 flex items-center justify-center rounded-full hover:bg-loss/10 transition-colors"
          aria-label={`Remove ${ticker} from watchlist`}
        >
          <IconX width={13} height={13} />
        </button>
      </form>

      <Link href={`/ticker/${encodeURIComponent(ticker)}`} className="block pr-6">
        <span className="flex items-center gap-2">
          <StockLogo ticker={ticker} size={large ? 24 : 20} />
          <span className={`font-mono font-semibold ${large ? "text-lg" : ""}`}>{ticker}</span>
        </span>

        <div className="flex items-end justify-between mt-3">
          <div>
            {quote?.price != null ? (
              <p className={`font-mono font-bold ${large ? "text-3xl" : "text-2xl"}`}>
                ${quote.price.toFixed(2)}
              </p>
            ) : (
              <p className="font-mono text-sm text-text-muted">Price unavailable</p>
            )}
            {pct != null && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`font-mono text-xs ${up ? "text-gain" : "text-loss"}`}>
                  {up ? "+" : ""}
                  {pct.toFixed(2)}%
                  {amount != null && <> ({up ? "+" : ""}${amount.toFixed(2)})</>} {periodLabel}
                </span>
                <Tooltip text={`Change over the selected time span (${periodLabel}), pick a different one above`} />
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <Sparkline points={history} up={up} width={large ? 170 : 110} height={large ? 50 : 32} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
