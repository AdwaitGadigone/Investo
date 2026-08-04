"use client";

// Nulls sort last regardless of direction, a missing quote shouldn't jump to the top of a "highest first" sort.
export function compareRows(a, b, key, dir) {
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === "string") return dir * av.localeCompare(bv);
  return dir * (av - bv);
}

// A clickable column header with a small sort arrow, shared by every sortable table on the site.
export function SortHeader({ label, sortKey, active, dir, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className={`flex items-center justify-end gap-0.5 text-[10px] uppercase tracking-wide hover:text-text transition-colors ${
        active ? "text-text" : "text-text-muted"
      } ${className}`}
    >
      {label}
      <span className={`text-[8px] ${active ? "opacity-100" : "opacity-30"}`}>{active && dir === -1 ? "▼" : "▲"}</span>
    </button>
  );
}
