"use client";

import { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "@/components/icons";

export const PERIODS = [
  { key: "day", label: "Today" },
  { key: "week", label: "Past week" },
  { key: "month", label: "Past month" },
  { key: "threeMonth", label: "Past 3 months" },
  { key: "ytd", label: "Year to date" },
  { key: "year", label: "Past year" },
  { key: "fiveYear", label: "Past 5 years" },
];

// One shared compact dropdown, replaces every section repeating its own row of 7 pill buttons.
export function PeriodDropdown({ value, onChange, periods = PERIODS, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const active = periods.find((p) => p.key === value) ?? periods[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 glass rounded-full pl-3.5 pr-2.5 py-1.5 text-sm font-mono text-text hover:border-discord transition-colors"
      >
        {active.label}
        <IconChevronDown width={13} height={13} className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 z-20 glass rounded-lg p-1 min-w-[150px] shadow-lg">
          {periods.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                onChange(p.key);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm font-mono rounded-md transition-colors ${
                p.key === value ? "bg-discord text-white" : "text-text-muted hover:bg-white/[0.05] hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
