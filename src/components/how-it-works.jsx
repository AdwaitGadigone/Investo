"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { GradientBlobs } from "@/components/gradient-blobs";

const STEPS = [
  {
    color: "text-discord",
    dot: "bg-discord",
    title: "Sign in with Discord",
    body: "One click, the same account you already use in the server. No new password.",
  },
  {
    color: "text-warm",
    dot: "bg-warm",
    title: "Your data is already here",
    body: "Watchlist, portfolio, alerts, whatever you've set up with the bot shows up instantly.",
  },
  {
    color: "text-cool",
    dot: "bg-cool",
    title: "Manage from either place",
    body: "Add a ticker on the web, see it in Discord. Set an alert in Discord, see it on the web.",
  },
];

export function HowItWorks() {
  // Gentle parallax, drifts slower than the page scrolls, so scrolling feels like part of the design.
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-border px-6 md:px-12 lg:px-16 py-24">
      <GradientBlobs variant="steps" />

      <motion.h2
        style={{ y }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-16 max-w-xl"
      >
        How it works
      </motion.h2>

      <div className="relative grid gap-x-10 gap-y-16 md:grid-cols-3">
        {/* Ties the connector to the same discord/warm/cool sequence as the numbered dots, instead of a flat gray line. */}
        <div
          className="hidden md:block absolute top-[14px] left-[10%] right-[10%] h-px"
          style={{ background: "linear-gradient(to right, var(--discord), var(--warm), var(--cool))" }}
        />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
            className="relative"
          >
            <span className={`relative z-10 h-8 w-8 rounded-full ${step.dot} flex items-center justify-center text-sm font-bold text-black mb-6`}>
              {i + 1}
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight mb-3">{step.title}</h3>
            <p className="text-text-muted leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
