export function Wordmark({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold tracking-tight ${className}`}>
      <img src="/investo-logo.png" alt="" width={500} height={374} className="w-[1.6em] h-auto flex-shrink-0" />
      {/* One flex child, not two: flex gap was pushing a separate "O" span away. */}
      <span>
        INVEST<span className="text-gain">O</span>
      </span>
    </span>
  );
}
