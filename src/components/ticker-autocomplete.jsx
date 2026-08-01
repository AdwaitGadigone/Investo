"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// A ticker text input with the same suggestions dropdown as the main search bar, except
// selecting a result just fills the field instead of navigating away, this is meant to
// sit inside a form (like /portfolio buy) where the rest of the fields still need filling.
export function TickerAutocomplete({ name = "ticker", placeholder = "Ticker", className = "" }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length === 0) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-24">
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required
        autoComplete="off"
        className={className}
      />

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full min-w-64 solid-overlay rounded-lg overflow-hidden"
          >
            {results.map((r) => (
              <button
                key={r.symbol}
                type="button"
                onClick={() => {
                  setValue(r.symbol);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-discord/15 transition-colors"
              >
                <span>
                  <span className="font-mono font-semibold text-sm">{r.symbol}</span>
                  <span className="text-text-muted text-xs ml-2">{r.name}</span>
                </span>
                {r.exchange && (
                  <span className="text-xs text-text-muted font-mono">{r.exchange}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
