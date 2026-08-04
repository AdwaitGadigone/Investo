import { addWatchlistTicker } from "@/lib/actions/watchlist";
import { getPopularTickers } from "@/lib/market/discover";
import { Reveal } from "@/components/reveal";
import { IconPlus } from "@/components/icons";

// Reuses the same cached "most actively traded" fetch the dashboard's other panels already made, not a separate one.
export async function SuggestedStocks({ exclude, className = "mb-12" }) {
  const active = await getPopularTickers();
  const suggestions = active.filter((s) => !exclude.includes(s.ticker)).slice(0, 12);
  if (suggestions.length === 0) return null;

  return (
    <Reveal className={className}>
      <p className="font-display text-2xl font-bold tracking-tight mb-5">Popular right now</p>
      <div className="flex flex-wrap gap-3">
        {suggestions.map((s) => (
          <form key={s.ticker} action={addWatchlistTicker}>
            <input type="hidden" name="ticker" value={s.ticker} />
            <button
              type="submit"
              title={s.name}
              className="flex items-center gap-2 glass rounded-full pl-4 pr-3 py-2 text-sm font-mono hover:border-warm hover:text-warm transition-colors"
            >
              {s.ticker}
              <IconPlus width={14} height={14} />
            </button>
          </form>
        ))}
      </div>
    </Reveal>
  );
}
