"use client";

import { motion } from "motion/react";
import { GradientBlobs } from "@/components/gradient-blobs";
import { IconSync, IconBell, IconWallet, IconLayers, IconChart, IconSparkle } from "@/components/icons";

const FEATURES = [
  {
    icon: IconSync,
    color: "bg-discord/15 text-discord",
    title: "One account, everywhere",
    body: "Add a ticker with a slash command in Discord, see it here instantly. Same database, no import, no syncing to wait on.",
  },
  {
    icon: IconBell,
    color: "bg-warm/15 text-warm",
    title: "Real alerts, not spam",
    body: "Big moves, price targets, a daily digest if you want one. Tuned once already to stop flooding a channel, that lesson carries over here.",
  },
  {
    icon: IconWallet,
    color: "bg-cool/15 text-cool",
    title: "Built for a real portfolio",
    body: "Not just a watchlist, log what you actually bought and see live profit and loss, not just price movement.",
  },
  {
    icon: IconLayers,
    color: "bg-gain/15 text-gain",
    title: "Stocks and crypto, one place",
    body: "Track them side by side instead of switching between apps for different asset classes.",
  },
  {
    icon: IconSparkle,
    color: "bg-discord/15 text-discord",
    title: "Analyst ratings, explained",
    body: "The buy/hold/sell breakdown, plus an AI-written take on why the rating looks the way it does.",
  },
  {
    icon: IconChart,
    color: "bg-warm/15 text-warm",
    title: "Charts that actually help",
    body: "Real price history, real timeframes, not a single flat sparkline pretending to be a chart.",
  },
];

export function FeatureStrip() {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 md:px-12 lg:px-16 py-24">
      <GradientBlobs variant="features" />

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-16 max-w-xl"
      >
        Everything in one place
      </motion.h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: "easeOut" }}
              whileHover={{ y: -6, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
              className="glass rounded-lg p-7"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full mb-5 ${feature.color}`}>
                <Icon width={20} height={20} />
              </span>
              <h3 className="font-display text-xl font-bold tracking-tight mb-3">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">{feature.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
