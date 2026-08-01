import { addWatchlistTicker } from "@/lib/actions/watchlist";
import { getMostActive } from "@/lib/market/discover";
import { IconPlus } from "@/components/icons";

// Real "most actively traded" data, not a hand-picked list, so this never runs dry.
export async function SuggestedStocks({ exclude }) {
  const active = await getMostActive(25);
  const suggestions = active.filter((s) => !exclude.includes(s.ticker)).slice(0, 12);
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-12">
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
    </div>
  );
}
