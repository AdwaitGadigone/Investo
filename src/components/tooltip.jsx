"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconInfo } from "@/components/icons";

// A hover tooltip for the small "what does this number mean" moments, e.g. clarifying
// that a watchlist card's percentage is today's change, not the week's or the month's.
export function Tooltip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex text-text-muted"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <IconInfo width={13} height={13} />
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap solid-overlay rounded-md px-2.5 py-1.5 text-xs text-text z-50"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
