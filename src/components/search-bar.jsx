"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export function SearchBar({ className = "" }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef(null);
  // Tracks the most recently fired query, so a slower earlier response can't overwrite a faster later one.
  const latestQuery = useRef("");

  // Debounced, so a fast typer doesn't fire a network request per keystroke.
  useEffect(() => {
    const query = value.trim();
    if (query.length === 0) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      latestQuery.current = query;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (latestQuery.current !== query) return;
        setResults(data.results ?? []);
        setActiveIndex(-1);
      } catch {
        if (latestQuery.current === query) setResults([]);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [value]);

  // Closes the dropdown on an outside click, standard autocomplete behavior.
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToTicker = (symbol) => {
    router.push(`/ticker/${encodeURIComponent(symbol)}`);
    setValue("");
    setResults([]);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      goToTicker(results[activeIndex].symbol);
      return;
    }
    const ticker = value.trim().toUpperCase();
    if (ticker) goToTicker(ticker);
  };

  const handleKeyDown = (e) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-discord"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search any stock or crypto (AAPL, BTC-USD...)"
            className="w-full bg-surface border-2 border-discord/25 rounded-full pl-14 pr-6 py-5 font-mono uppercase text-sm sm:text-base placeholder:normal-case placeholder:font-sans placeholder:text-text-muted/70 focus:outline-none focus:border-discord shadow-[0_0_50px_-18px_rgba(88,101,242,0.5)] transition-all"
            autoComplete="off"
          />
        </div>
      </form>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full solid-overlay rounded-lg overflow-hidden"
          >
            {results.map((result, i) => (
              <button
                key={result.symbol}
                type="button"
                onClick={() => goToTicker(result.symbol)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center justify-between px-5 py-3 text-left transition-colors ${
                  i === activeIndex ? "bg-discord/15" : ""
                }`}
              >
                <span>
                  <span className="font-mono font-semibold">{result.symbol}</span>
                  <span className="text-text-muted text-sm ml-3">{result.name}</span>
                </span>
                {result.exchange && (
                  <span className="text-xs text-text-muted font-mono">{result.exchange}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
