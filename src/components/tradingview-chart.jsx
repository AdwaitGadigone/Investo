"use client";

import { useEffect, useRef, useId } from "react";

// TradingView's own widget, its toolbar already has a day/week/month range picker built in.
export function TradingViewChart({ symbol }) {
  const containerRef = useRef(null);
  const elementId = `tv-chart-${useId().replace(/[:]/g, "")}`;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = elementId;
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (!window.TradingView || !containerRef.current) return;
      new window.TradingView.widget({
        autosize: true,
        symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#18191c",
        enable_publishing: false,
        allow_symbol_change: false,
        hide_side_toolbar: true,
        container_id: elementId,
      });
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [symbol, elementId]);

  return <div ref={containerRef} className="w-full" style={{ height: 460 }} />;
}
