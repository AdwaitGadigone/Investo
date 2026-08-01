"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { MockDashboardPreview } from "@/components/mock-dashboard-preview";
import { GradientBlobs } from "@/components/gradient-blobs";
import { TrendArrow } from "@/components/trend-arrow";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Hero({ quotes, user }) {
  return (
    <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      <GradientBlobs />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-16 items-center">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.1 }}>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="h-2 w-2 rounded-full bg-cool animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Live on the web now
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.92]"
          >
            One place for{" "}
            <span className="text-discord">stocks</span>,{" "}
            <span className="text-warm">crypto</span> &amp;{" "}
            <span className="text-cool">more</span>.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-8 text-xl text-text-muted leading-relaxed max-w-lg"
          >
            Everything already tracked in Discord, watchlists, portfolios, alerts,
            synced here the instant you set it. No new account, no re-typing anything.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 bg-discord text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-discord-hover transition-colors shadow-lg shadow-discord/25"
                >
                  Continue as {user.username}
                </Link>
                <span className="text-sm text-text-muted">You're already signed in.</span>
              </>
            ) : (
              <>
                <DiscordSignInButton className="flex items-center gap-3 bg-discord text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-discord-hover transition-colors shadow-lg shadow-discord/25" />
                <span className="text-sm text-text-muted">Free, takes 5 seconds.</span>
              </>
            )}
          </motion.div>
        </motion.div>

        <div className="relative hidden lg:block">
          {/* left/right are both set (no fixed width) so the browser sizes it to span the
              overshoot on each side, tail starting well left of the card, head landing well
              past its right edge, instead of being boxed in to the card's own footprint. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute -top-14 -left-[90%] -right-[75%] -z-10 h-[140%] opacity-60"
          >
            <TrendArrow className="w-full h-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="relative z-10"
          >
            <MockDashboardPreview quotes={quotes} />
          </motion.div>

          {/* Rotation matches the card above (-3deg) on purpose, two overlapping rectangles
              at DIFFERENT angles never fully cover each other at the corners no matter how
              opaque either one is, that mismatch (not transparency) was what let the card's
              corner poke out past this badge. Same angle, edges stay parallel, nothing leaks. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -3, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.7 },
              scale: { duration: 0.6, delay: 0.7 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.3 },
            }}
            className="absolute -bottom-8 -left-8 z-20 solid-overlay rounded-lg px-4 py-3"
          >
            <p className="font-mono text-xs text-text-muted">Alerts checked</p>
            <p className="font-mono text-lg font-bold text-warm">every 15 min</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
