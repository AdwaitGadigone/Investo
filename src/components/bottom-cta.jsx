"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { GradientBlobs } from "@/components/gradient-blobs";
import { TrendArrow } from "@/components/trend-arrow";

export function BottomCta({ user }) {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 py-28 text-center">
      <GradientBlobs variant="cta" />

      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
        whileInView={{ opacity: 0.12, scale: 1, rotate: -4 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2 -z-10"
      >
        <TrendArrow />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-8">
          Your data&apos;s already waiting.
        </h2>
        <DiscordSignInButton className="inline-flex items-center gap-3 bg-discord text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-discord-hover transition-colors shadow-lg shadow-discord/20" />
      </motion.div>
    </section>
  );
}
