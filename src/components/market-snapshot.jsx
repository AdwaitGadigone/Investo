"use client";

import { motion } from "motion/react";
import { Tooltip } from "@/components/tooltip";

// The "how's the whole market doing" context that was missing before you even got to your
// own stuff, real index quotes, not decoration.
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
            {/* "pts" since an index level isn't priced in dollars, it's a weighted score of
                every stock in it, unlike everything else on the site which is a real price. */}
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
