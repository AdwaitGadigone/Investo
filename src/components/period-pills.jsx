"use client";

import { motion } from "motion/react";

export const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
  { key: "ytd", label: "YTD" },
  { key: "year", label: "Year" },
  { key: "fiveYear", label: "5Y" },
];

// One shared pill row, layoutId must be unique per usage or the sliding pill animates between unrelated selectors.
export function PeriodPills({ value, onChange, layoutId, periods = PERIODS, className = "" }) {
  return (
    <div className={`flex items-center gap-1 glass rounded-full p-1 max-w-full overflow-x-auto ${className}`}>
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
        >
          {value === p.key && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 bg-discord rounded-full -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className={value === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
