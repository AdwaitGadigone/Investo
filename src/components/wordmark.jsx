// Red into green glyph, not just green, so it reads as "stocks" not "line going up."
export function Wordmark({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold tracking-tight ${className}`}>
      <svg
        width="0.85em"
        height="0.85em"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M3 16 L9 11" stroke="currentColor" className="text-loss" />
        <path d="M9 11 L14 15 L21 5" stroke="currentColor" className="text-gain" />
        <path d="M15 5 L21 5 L21 11" stroke="currentColor" className="text-gain" />
      </svg>
      {/* One flex child, not two: flex gap was pushing a separate "O" span away. */}
      <span>
        INVEST<span className="text-gain">O</span>
      </span>
    </span>
  );
}
