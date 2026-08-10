"use client";

import { motion } from "motion/react";

const TICKERS = [
  { t: "AAPL", up: true }, { t: "TSLA", up: false }, { t: "NVDA", up: true },
  { t: "BTC", up: true }, { t: "AMZN", up: false }, { t: "META", up: true },
  { t: "MSFT", up: true }, { t: "GOOGL", up: false }, { t: "ETH", up: true },
  { t: "AMD", up: true }, { t: "NFLX", up: false }, { t: "GOLD", up: true },
];

// Edge-to-edge ticker tape, makes the top of the page feel wide and alive, not boxed in.
export function TickerMarquee() {
  const row = [...TICKERS, ...TICKERS];

  return (
    <div
      className="w-full overflow-hidden border-b border-border bg-surface py-3"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent)",
      }}
    >
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {row.map((item, i) => (
          <span key={i} className="font-mono text-sm flex items-center gap-2 flex-shrink-0">
            <span className="text-text-muted">{item.t}</span>
            <span className={item.up ? "text-gain" : "text-loss"}>
              {item.up ? "▲" : "▼"}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
