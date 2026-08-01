"use client";

import { motion } from "motion/react";
import { IconChart, IconStar, IconWallet } from "@/components/icons";

const STEPS = [
  {
    icon: IconChart,
    color: "bg-discord/15 text-discord",
    title: "Search a stock",
    body: "Try the search bar above, any stock or crypto works.",
  },
  {
    icon: IconStar,
    color: "bg-warm/15 text-warm",
    title: "Add it to your watchlist",
    body: "One click on any ticker page, or use a suggestion below.",
  },
  {
    icon: IconWallet,
    color: "bg-cool/15 text-cool",
    title: "Log a real position",
    body: "Head to the Portfolio tab to track shares you actually own.",
  },
];

// Only for a genuinely empty account, guides the first actions instead of a blank dashboard.
export function GettingStarted() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-lg p-6 mb-12"
    >
      <p className="font-display text-xl font-bold tracking-tight mb-1">Welcome to Investo.</p>
      <p className="text-text-muted text-sm mb-6">A few things to try first.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full mb-3 ${step.color}`}>
                <Icon width={16} height={16} />
              </span>
              <p className="font-semibold text-sm mb-1">{step.title}</p>
              <p className="text-xs text-text-muted leading-relaxed">{step.body}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
