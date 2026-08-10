"use client";

import { useState } from "react";
import { WatchlistCard } from "@/components/watchlist-card";
import { PeriodPills } from "@/components/period-pills";

const PERIOD_TEXT = {
  day: "today",
  week: "this week",
  month: "this month",
  threeMonth: "over 3 months",
  ytd: "year to date",
  year: "this year",
  fiveYear: "over 5 years",
};

// The big-card /watchlist grid, with its own time-span selector shared across every card.
export function WatchlistGrid({ tickers, quoteByTicker, historyByTicker, periodChangesByTicker }) {
  const [period, setPeriod] = useState("day");

  return (
    <div className="mb-12">
      <div className="flex justify-end mb-5">
        <PeriodPills value={period} onChange={setPeriod} layoutId="watchlist-grid-pill" />
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
