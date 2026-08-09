"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/reveal";
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

// Kept as its own row, not folded into "Popular right now": crypto and stocks are different enough to browse separately.
export function CryptoStrip({ quotes, periodChangesByTicker = {}, className = "mb-12" }) {
  const [period, setPeriod] = useState("day");

  if (quotes.length === 0) return null;

  return (
    <div className={className}>
      <p className="font-display text-2xl font-bold tracking-tight mb-3">Crypto</p>
      <div className="flex items-center gap-1 glass rounded-full p-1 mb-5 w-fit max-w-full overflow-x-auto">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
          >
            {period === p.key && (
              <motion.span
                layoutId="crypto-pill"
                className="absolute inset-0 bg-discord rounded-full -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            )}
            <span className={period === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
          </button>
        ))}
      </div>

      <Reveal className="flex flex-wrap gap-3">
        {quotes.map((q) => {
          const periodChange = period === "day" ? null : periodChangesByTicker[q.ticker]?.[period];
          const changePct = period === "day" ? q.changePct : periodChange?.pct;
          const up = changePct != null && changePct >= 0;

          return (
            <Link
              key={q.ticker}
              href={`/ticker/${encodeURIComponent(q.ticker)}`}
              className="glass rounded-lg px-5 py-3 hover:border-cool transition-colors min-w-36 flex items-center gap-3"
            >
              <StockLogo ticker={q.ticker} size={24} />
              <div>
                <p className="text-sm font-semibold">{q.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-sm">${q.price?.toFixed(2) ?? "-"}</span>
                  <span className={`font-mono text-xs ${up ? "text-gain" : "text-loss"}`}>
                    {changePct != null ? `${up ? "+" : ""}${changePct.toFixed(2)}%` : "-"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </Reveal>
    </div>
  );
}
