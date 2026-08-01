"use client";

import { motion } from "motion/react";
import { Tooltip } from "@/components/tooltip";

// "How's the whole market doing" context, real index quotes, not decoration.
export function MarketSnapshot({ indices }) {
  if (indices.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-10">
      {indices.map((index, i) => {
        const up = index.changePct >= 0;
        return (
          <motion.div
            key={index.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="flex items-center gap-3 glass rounded-full pl-4 pr-5 py-2"
          >
            <span className="text-sm font-medium text-text-muted">{index.label}</span>
            {/* "pts" not "$", an index level is a weighted score, not a real price. */}
            <span className="font-mono text-sm">{index.price.toLocaleString()} pts</span>
            <span className={`font-mono text-sm ${up ? "text-gain" : "text-loss"}`}>
              {up ? "+" : ""}
              {index.changePct.toFixed(2)}% today
            </span>
          </motion.div>
        );
      })}
      <Tooltip text="Change since yesterday's market close, an index tracks a whole basket of stocks, not one company" />
    </div>
  );
}
