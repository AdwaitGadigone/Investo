"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";

// Counts up from 0 to the real value on mount instead of just appearing, this is the
// "more than hover" motion for the big numbers that actually deserve some weight (total
// portfolio value, today's return), writes directly to the DOM node instead of triggering
// a React re-render every animation frame, which is the standard pattern for this.
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
