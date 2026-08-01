"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/reveal";
import { Tooltip } from "@/components/tooltip";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
  { key: "year", label: "Year" },
  { key: "fiveYear", label: "5Y" },
];

const EXPLAINERS = {
  "Top Gainers": "Biggest % price increase over the period picked above, filtered to real, well-known companies (not thin-volume microcaps).",
  "Top Losers": "Biggest % price drop over the period picked above, same real-company filter.",
  "Most Active": "Highest trading volume today. This one always reflects today specifically, volume history isn't tracked far enough back to rank it by week or month yet.",
};

function MoverList({ title, rows }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center gap-1.5 mb-3">
        <p className="font-display text-lg font-bold tracking-tight">{title}</p>
        <Tooltip text={EXPLAINERS[title]} />
      </div>
      <div className="h-px bg-border mb-1" />
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted pt-3">Not enough data right now.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-x-auto">
          {rows.map((row) => {
            const up = row.changePct >= 0;
            return (
              <Link
                key={row.ticker}
                href={`/ticker/${encodeURIComponent(row.ticker)}`}
                className="grid grid-cols-[1fr_68px_60px_64px] items-center gap-2 py-2.5 min-w-[300px] hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0">
                  <p className="font-mono font-semibold text-sm">{row.ticker}</p>
                  <p className="text-xs text-text-muted truncate">{row.name}</p>
                </div>
                <span className="font-mono text-sm text-right">${row.price.toFixed(2)}</span>
                <span className={`font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
                  {up ? "+" : ""}
                  {row.changePct.toFixed(2)}%
                </span>
                <span className={`font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
                  {row.change != null ? `${up ? "+" : ""}$${row.change.toFixed(2)}` : ""}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// The same "gainers / losers / most active" layout real market sites use, real large-cap
// movers (filtered by market cap, not whatever obscure microcap spiked 200% on no volume),
// now with the same period tabs Top Performers uses so "today" isn't the only option.
export function MarketMovers({ data }) {
  const [period, setPeriod] = useState("day");
  const rows = data[period] ?? { gainers: [], losers: [], active: [] };

  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="font-display text-2xl font-bold tracking-tight">Market movers</p>
        <div className="inline-flex items-center gap-1 glass rounded-full p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="relative px-3.5 py-1.5 text-sm font-mono rounded-full"
            >
              {period === p.key && (
                <motion.span
                  layoutId="movers-pill"
                  className="absolute inset-0 bg-discord rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className={period === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Reveal className="grid gap-4 sm:grid-cols-3">
        <MoverList title="Top Gainers" rows={rows.gainers} />
        <MoverList title="Top Losers" rows={rows.losers} />
        <MoverList title="Most Active" rows={rows.active} />
      </Reveal>
    </div>
  );
}
