"use client";

import { useEffect, useRef } from "react";
import { createChart, AreaSeries } from "lightweight-charts";

// lightweight-charts is a vanilla JS library (not a React component), so it has to be
// mounted imperatively into a plain div via a ref, this is the standard pattern for that.
export function PriceChart({ data, up }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        // lightweight-charts has no separate font-weight option, canvas text only takes
        // size + family, so "bold" here means high contrast and a bigger size instead,
        // that's what actually reads as bold given the API's limits.
        textColor: "#f2f2f0",
        fontSize: 13,
        fontFamily: "'IBM Plex Mono', monospace",
        // The library's license requires attribution somewhere: either this built-in
        // logo on the chart itself, or an equivalent text link elsewhere on the site.
        // Keeping the logo here instead means the footer doesn't need a TradingView line.
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
