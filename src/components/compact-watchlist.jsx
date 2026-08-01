import Link from "next/link";
import { Sparkline } from "@/components/sparkline";
import { IconX } from "@/components/icons";
import { removeWatchlistTicker } from "@/lib/actions/watchlist";

// The dashboard glance version, one row per ticker, versus the big card-per-ticker
// treatment the dedicated /watchlist page uses, same data, denser layout. Price, % change,
// and $ change each get their own grid column instead of being stacked and crammed
// against the right edge, spreads the numbers across the row's actual width so they're
// bigger targets to read at a glance instead of squinting at a cluster in one corner.
export function CompactWatchlist({ tickers, quoteByTicker, historyByTicker }) {
  return (
    <div className="glass rounded-lg divide-y divide-border overflow-x-auto">
      {tickers.map((ticker) => {
        const quote = quoteByTicker[ticker];
        const up = quote?.changePct != null && quote.changePct >= 0;
        return (
          <div
            key={ticker}
            className="grid grid-cols-[60px_1fr_80px_84px_84px_24px] items-center gap-4 px-4 py-3.5 min-w-[460px] hover:bg-white/[0.03] transition-colors"
          >
            <Link href={`/ticker/${encodeURIComponent(ticker)}`} className="contents">
              <span className="font-mono font-semibold text-sm">{ticker}</span>
              <Sparkline points={historyByTicker[ticker]} up={up} width={64} height={24} />
              <span className="font-mono text-sm text-right">
                {quote?.price != null ? `$${quote.price.toFixed(2)}` : "—"}
              </span>
              <span className={`font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                {quote?.changePct != null ? `${up ? "+" : ""}${quote.changePct.toFixed(2)}%` : "—"}
              </span>
              <span className={`font-mono text-sm text-right ${up ? "text-gain" : "text-loss"}`}>
                {quote?.change != null ? `${up ? "+" : "-"}$${Math.abs(quote.change).toFixed(2)}` : ""}
              </span>
            </Link>
            <form action={removeWatchlistTicker} className="flex justify-end">
              <input type="hidden" name="ticker" value={ticker} />
              <button
                type="submit"
                className="text-text-muted hover:text-loss w-6 h-6 flex items-center justify-center rounded-full hover:bg-loss/10 transition-colors"
                aria-label={`Remove ${ticker} from watchlist`}
              >
                <IconX width={12} height={12} />
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
