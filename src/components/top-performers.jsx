"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkline } from "@/components/sparkline";
import { StockLogo } from "@/components/stock-logo";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
  { key: "ytd", label: "YTD" },
  { key: "year", label: "Year" },
  { key: "fiveYear", label: "5Y" },
];

export function TopPerformers({ data, compact = false, className = "mb-12" }) {
  const [period, setPeriod] = useState("day");
  const rows = data[period] ?? [];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="font-display text-2xl font-bold tracking-tight">Top performers</p>
        <div className="flex items-center gap-1 glass rounded-full p-1 max-w-full overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
            >
              {period === p.key && (
                <motion.span
                  layoutId="performers-pill"
                  className="absolute inset-0 bg-discord rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className={period === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-text-muted text-sm">Not enough data right now, check back shortly.</p>
      ) : compact ? (
        <div className="glass rounded-lg divide-y divide-border">
          {/* One header row, not a caption per number per row, so it reads as a table. */}
          <div className="hidden sm:grid grid-cols-[24px_60px_1fr_84px_84px] gap-2 sm:gap-4 px-3 sm:px-4 py-2">
            <span />
            <span />
            <span />
            <span className="text-[10px] uppercase tracking-wide text-text-muted text-right col-span-2">Change</span>
          </div>
          {rows.map((row, i) => {
            const up = row.changePct >= 0;
            const pctText = `${up ? "+" : ""}${row.changePct.toFixed(1)}%`;
            const dollarText = row.change != null ? `${up ? "+" : ""}$${row.change.toFixed(2)}` : "";
            return (
              <Link
                key={row.ticker}
                href={`/ticker/${encodeURIComponent(row.ticker)}`}
                className="grid grid-cols-[20px_1fr_84px] sm:grid-cols-[24px_60px_1fr_84px_84px] items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-mono text-xs text-text-muted">{i + 1}</span>
                <span className="flex items-center gap-1.5 min-w-0">
                  <StockLogo ticker={row.ticker} size={18} />
                  <span className="font-mono font-semibold text-sm truncate">{row.ticker}</span>
                </span>
                <div className="hidden sm:block">
                  <Sparkline points={row.history} up={up} width={90} height={24} />
                </div>
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
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {rows.map((row, i) => {
            const up = row.changePct >= 0;
            return (
              <Link key={row.ticker} href={`/ticker/${encodeURIComponent(row.ticker)}`}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="glass rounded-lg p-4 hover:border-gain transition-colors"
                >
                  <span className="font-mono text-xs text-text-muted">#{i + 1}</span>
                  <p className="flex items-center gap-1.5 font-mono font-semibold mt-1">
                    <StockLogo ticker={row.ticker} size={20} />
                    {row.ticker}
                  </p>
                  <Sparkline points={row.history} up={up} width={110} height={30} />
                  <p className={`font-mono text-sm mt-1 ${up ? "text-gain" : "text-loss"}`}>
                    {up ? "+" : ""}
                    {row.changePct.toFixed(1)}%
                  </p>
                  {row.change != null && (
                    <p className={`font-mono text-xs ${up ? "text-gain" : "text-loss"}`}>
                      {up ? "+" : ""}${row.change.toFixed(2)}
                    </p>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
