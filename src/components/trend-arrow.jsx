"use client";

import { motion } from "motion/react";

// A bold, solid "up and to the right" arrow, zigzag line plus a real filled triangular
// arrowhead (not a hint of one), matching how an actual trend chart draws itself, floating
// with a soft drop shadow the way a physical object would.
const LINE = "10,320 150,255 250,285 390,140 490,180 660,55";
// The final segment (490,180) -> (660,55) points at roughly this angle, the arrowhead
// triangle gets rotated to match it exactly.
const HEAD_ANGLE = -35.5;

export function TrendArrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 720 380"
      preserveAspectRatio="none"
      className={`pointer-events-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)] ${className}`}
      fill="none"
    >
      <motion.polyline
        points={LINE}
        stroke="var(--text)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.35, ease: "backOut" }}
        style={{ transformOrigin: "660px 55px" }}
      >
        <g transform={`translate(660,55) rotate(${HEAD_ANGLE})`}>
          <polygon points="0,-38 68,0 0,38" fill="var(--text)" />
        </g>
      </motion.g>
    </svg>
  );
}
