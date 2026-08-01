"use client";

import { motion } from "motion/react";

// Stylized, not a real chart, just motion to sell "this card is alive" next to real numbers.
const UP_PATH = "0,20 10,17 20,18 30,12 40,13 50,6 60,8 70,2";
const DOWN_PATH = "0,4 10,6 20,5 30,9 40,8 50,13 60,12 70,18";

export function MockDashboardPreview({ quotes }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      // solid-overlay, not glass: an animated transform + backdrop-filter let the arrow show through.
      className="w-full max-w-sm solid-overlay rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Watchlist
        </span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-gain">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-gain"
          />
          live
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {quotes.map((row, i) => {
          const up = row.changePct >= 0;
          return (
            <motion.div
              key={row.ticker}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: "easeOut" }}
              className="flex items-center justify-between border border-border rounded-md px-3 py-2.5"
            >
              <div>
                <p className="font-mono text-sm font-medium">{row.ticker}</p>
                <p className="font-mono text-xs text-text-muted">${row.price.toFixed(2)}</p>
              </div>

              <svg width="70" height="22" viewBox="0 0 70 22" className="mx-3 flex-shrink-0">
                <motion.polyline
                  points={up ? UP_PATH : DOWN_PATH}
                  fill="none"
                  stroke={up ? "var(--gain)" : "var(--loss)"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 + i * 0.12, ease: "easeOut" }}
                />
              </svg>

              <span
                className={`font-mono text-xs font-medium ${up ? "text-gain" : "text-loss"}`}
              >
                {up ? "+" : ""}
                {row.changePct.toFixed(1)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
