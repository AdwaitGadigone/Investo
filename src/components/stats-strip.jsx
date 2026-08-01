"use client";

import { motion } from "motion/react";

const STATS = [
  { value: "3", label: "asset classes tracked", color: "text-discord" },
  { value: "15min", label: "automatic move checks", color: "text-warm" },
  { value: "24/7", label: "synced with Discord", color: "text-cool" },
  { value: "0", label: "extra accounts to make", color: "text-gain" },
];

export function StatsStrip() {
  return (
    <section className="border-t border-border bg-surface px-6 md:px-12 lg:px-16 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "backOut" }}
            className="text-center"
          >
            <p className={`font-mono text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-text-muted text-sm mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
