"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
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
        <div className="inline-flex items-center gap-1 glass rounded-full p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="relative px-3.5 py-1.5 text-sm font-mono rounded-full"
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
        <div className="glass rounded-lg divide-y divide-border overflow-x-auto">
          {rows.map((row, i) => {
            const up = row.changePct >= 0;
            return (
              <Link
                key={row.ticker}
                href={`/ticker/${encodeURIComponent(row.ticker)}`}
                className="grid grid-cols-[24px_1fr_84px_84px] items-center gap-4 px-4 py-3.5 min-w-[380px] hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-mono text-xs text-text-muted">{i + 1}</span>
                <span className="font-mono font-semibold text-sm">{row.ticker}</span>
                <span className={`font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                  {up ? "+" : ""}
                  {row.changePct.toFixed(1)}%
                </span>
                <span className={`font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                  {row.change != null ? `${up ? "+" : ""}$${row.change.toFixed(2)}` : ""}
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
                  <p className="font-mono font-semibold mt-1">{row.ticker}</p>
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
