"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/reveal";
import { Tooltip } from "@/components/tooltip";
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
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted pt-3">Not enough data right now.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {/* One header row, not a caption per number per row, so it reads as a table. */}
          <div className="hidden sm:grid grid-cols-[1fr_50px_64px_58px_62px] gap-2 pb-1.5">
            <span />
            <span />
            <span className="text-[10px] uppercase tracking-wide text-text-muted text-right">Price</span>
            <span className="text-[10px] uppercase tracking-wide text-text-muted text-right col-span-2">Change</span>
          </div>
          {rows.map((row) => {
            const up = row.changePct >= 0;
            const pctText = `${up ? "+" : ""}${row.changePct.toFixed(2)}%`;
            const dollarText = row.change != null ? `${up ? "+" : ""}$${row.change.toFixed(2)}` : "";
            return (
              <Link
                key={row.ticker}
                href={`/ticker/${encodeURIComponent(row.ticker)}`}
                className="grid grid-cols-[1fr_58px_64px] sm:grid-cols-[1fr_50px_64px_58px_62px] items-center gap-2 py-2.5 hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0 flex items-center gap-1.5">
                  <StockLogo ticker={row.ticker} size={20} />
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-sm">{row.ticker}</p>
                    <p className="text-xs text-text-muted truncate">{row.name}</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Sparkline points={row.history} up={up} width={50} height={22} />
                </div>
                <span className="font-mono text-xs sm:text-sm text-right">${row.price.toFixed(2)}</span>
                <span className={`hidden sm:inline font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
                  {pctText}
                </span>
                <span className={`hidden sm:inline font-mono text-xs text-right ${up ? "text-gain" : "text-loss"}`}>
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
      )}
    </div>
  );
}

// Real large-cap movers only, filtered by market cap, not a microcap that spiked on no volume.
export function MarketMovers({ data }) {
  const [period, setPeriod] = useState("day");
  const rows = data[period] ?? { gainers: [], losers: [], active: [] };

  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="font-display text-2xl font-bold tracking-tight">Market movers</p>
        <div className="flex items-center gap-1 glass rounded-full p-1 max-w-full overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
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
