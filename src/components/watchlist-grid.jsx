"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { WatchlistCard } from "@/components/watchlist-card";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "threeMonth", label: "3M" },
  { key: "year", label: "Year" },
  { key: "fiveYear", label: "5Y" },
];

const PERIOD_TEXT = {
  day: "today",
  week: "this week",
  month: "this month",
  threeMonth: "over 3 months",
  year: "this year",
  fiveYear: "over 5 years",
};

// The big-card /watchlist grid, with its own time-span selector shared across every card.
export function WatchlistGrid({ tickers, quoteByTicker, historyByTicker, periodChangesByTicker }) {
  const [period, setPeriod] = useState("day");

  return (
    <div className="mb-12">
      <div className="flex justify-end mb-5">
        <div className="flex items-center gap-1 glass rounded-full p-1 max-w-full overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="relative shrink-0 px-2.5 sm:px-3.5 py-1.5 text-sm font-mono rounded-full"
            >
              {period === p.key && (
                <motion.span
                  layoutId="watchlist-grid-pill"
                  className="absolute inset-0 bg-discord rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className={period === p.key ? "text-white" : "text-text-muted"}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {tickers.map((ticker, i) => (
          <WatchlistCard
            key={ticker}
            ticker={ticker}
            quote={quoteByTicker[ticker]}
            history={historyByTicker[ticker]}
            index={i}
            large
            periodChange={period === "day" ? null : periodChangesByTicker?.[ticker]?.[period]}
            periodLabel={PERIOD_TEXT[period]}
          />
        ))}
      </div>
    </div>
  );
}
