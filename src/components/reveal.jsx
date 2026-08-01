"use client";

import { motion } from "motion/react";

// A small reusable scroll-in wrapper, keeps pages that are mostly Server Components from
// needing to become client components just to get the same entrance motion as everywhere
// else on the site.
export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
