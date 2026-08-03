"use client";

import { useEffect, useRef } from "react";
import { createChart, AreaSeries } from "lightweight-charts";

// Vanilla JS library, not a React component, so it mounts imperatively into a ref'd div.
export function PriceChart({ data, up }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      // attributionLogo is left at its default (visible) since the library's license requires it.
      layout: {
        background: { color: "transparent" },
        // No font-weight option exists, high contrast + bigger size is the closest to "bold".
        textColor: "#f2f2f0",
        fontSize: 13,
        fontFamily: "'IBM Plex Mono', monospace",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.08)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      height: 320,
      width: containerRef.current.clientWidth,
    });

    const color = up ? "#0ca30c" : "#d03b3b";
    const series = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}33`,
      bottomColor: `${color}00`,
      lineWidth: 2,
    });
    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, up]);

  return <div ref={containerRef} className="w-full" />;
}
