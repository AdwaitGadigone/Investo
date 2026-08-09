"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { StockLogo } from "@/components/stock-logo";
import { PeriodDropdown } from "@/components/period-dropdown";

// Kept as its own row, not folded into "Popular right now": crypto and stocks are different enough to browse separately.
export function CryptoStrip({ quotes, periodChangesByTicker = {}, className = "mb-12" }) {
  const [period, setPeriod] = useState("day");

  if (quotes.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="font-display text-2xl font-bold tracking-tight">Crypto</p>
        <PeriodDropdown value={period} onChange={setPeriod} />
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
