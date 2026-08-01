import Link from "next/link";
import { Reveal } from "@/components/reveal";

// Yahoo's text search buries gold behind an unrelated company, so this is a direct shortcut.
export function CommoditiesStrip({ commodities }) {
  if (commodities.length === 0) return null;

  return (
    <div className="mb-12">
      <p className="font-display text-2xl font-bold tracking-tight mb-5">Commodities</p>
      <Reveal className="flex flex-wrap gap-3">
        {commodities.map((c) => {
          const up = c.changePct >= 0;
          return (
            <Link
              key={c.ticker}
              href={`/commodities/${c.slug}`}
              className="glass rounded-lg px-5 py-3 hover:border-warm transition-colors min-w-36"
            >
              <p className="text-sm font-semibold">{c.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-sm">${c.price.toFixed(2)}</span>
                <span className={`font-mono text-xs ${up ? "text-gain" : "text-loss"}`}>
                  {up ? "+" : ""}
                  {c.changePct.toFixed(2)}%
                </span>
              </div>
              {c.unit && <p className="text-xs text-text-muted mt-0.5">per {c.unit}</p>}
            </Link>
          );
        })}
      </Reveal>
    </div>
  );
}
