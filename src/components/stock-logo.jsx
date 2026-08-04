"use client";

import { useState } from "react";

// Free, no API key, keyed by ticker directly. Strips exchange suffixes (.NE, .TO) since the logo is per-company, not per-listing.
function logoUrl(ticker) {
  const base = ticker.split(".")[0];
  return `https://images.financialmodelingprep.com/symbol/${base}.png`;
}

// Hides itself on a 404 instead of showing a broken image icon, most crypto/commodity tickers have no logo here.
export function StockLogo({ ticker, size = 28, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!ticker || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl(ticker)}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded-full shrink-0 bg-white/5 ${className}`}
    />
  );
}
