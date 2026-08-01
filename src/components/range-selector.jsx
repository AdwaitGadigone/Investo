"use client";

import Link from "next/link";
import { motion } from "motion/react";

const RANGES = [
  { key: "1d", label: "1D" },
  { key: "1w", label: "1W" },
  { key: "1mo", label: "1M" },
  { key: "3mo", label: "3M" },
  { key: "6mo", label: "6M" },
  { key: "ytd", label: "YTD" },
  { key: "1y", label: "1Y" },
  { key: "5y", label: "5Y" },
  { key: "10y", label: "10Y" },
];

// One sliding pill (Framer Motion layoutId) moves between buttons, not a highlight per button.
export function RangeSelector({ ticker, active }) {
  return (
    <div className="inline-flex items-center gap-1 glass rounded-full p-1">
      {RANGES.map((r) => (
        <Link
          key={r.key}
          href={`/ticker/${encodeURIComponent(ticker)}?range=${r.key}`}
          scroll={false}
          className="relative px-3.5 py-1.5 text-sm font-mono rounded-full"
        >
          {active === r.key && (
            <motion.span
              layoutId="range-pill"
              className="absolute inset-0 bg-discord rounded-full -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className={active === r.key ? "text-white" : "text-text-muted"}>{r.label}</span>
        </Link>
      ))}
    </div>
  );
}
