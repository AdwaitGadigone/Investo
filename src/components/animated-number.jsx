"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";

// Counts up on mount, writes the DOM node directly instead of re-rendering every frame.
export function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2 }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [value, prefix, suffix, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
