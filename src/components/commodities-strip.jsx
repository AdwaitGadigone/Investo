"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/reveal";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
  { key: "ytd", label: "YTD" },
  { key: "year", label: "Year" },
  { key: "fiveYear", label: "5Y" },
];

// Yahoo's text search buries gold behind an unrelated company, so this is a direct shortcut.
export function CommoditiesStrip({ commodities, periodChangesByTicker = {}, className = "mb-12" }) {
  const [period, setPeriod] = useState("day");

  if (commodities.length === 0) return null;

  return (
    <div className={className}>
      <p className="font-display text-2xl font-bold tracking-tight mb-3">Commodities</p>
      <div className="flex items-center gap-1 glass rounded-full p-1 mb-5 w-fit max-w-full overflow-x-auto">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
          >
            {period === p.key && (
              <motion.span
                layoutId="commodities-pill"
                className="absolute inset-0 bg-discord rounded-full -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            )}
            <span className={period === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
          </button>
        ))}
      </div>

      <Reveal className="flex flex-wrap gap-3">
        {commodities.map((c) => {
          const periodChange = period === "day" ? null : periodChangesByTicker[c.ticker]?.[period];
          const changePct = period === "day" ? c.changePct : periodChange?.pct;
          const up = changePct != null && changePct >= 0;

          return (
            <Link
              key={c.ticker}
              href={`/commodities/${c.slug}`}
              className="glass rounded-lg px-5 py-3 hover:border-warm transition-colors min-w-36"
            >
              <p className="text-sm font-semibold">{c.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-sm">${c.price.toFixed(2)}</span>
                <span className={`font-mono text-xs ${up ? "text-gain" : "text-loss"}`}>
                  {changePct != null ? `${up ? "+" : ""}${changePct.toFixed(2)}%` : "—"}
                </span>
              </div>
              {c.unit && <p className="text-xs text-text-muted mt-0.5">per {c.unit}</p>}
            </Link>
          );
        })}
      </Reveal>
    </div>
  );
}
