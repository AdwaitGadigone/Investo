import { addWatchlistTicker, removeWatchlistTicker } from "@/lib/actions/watchlist";
import { IconStar } from "@/components/icons";

// A plain form + Server Action, works without any client JS, same pattern as the
// watchlist page's add/remove buttons.
export function WatchlistToggle({ ticker, isWatchlisted }) {
  if (isWatchlisted) {
    return (
      <form action={removeWatchlistTicker}>
        <input type="hidden" name="ticker" value={ticker} />
        <button
          type="submit"
          className="flex items-center gap-2 border border-warm bg-warm/15 text-warm px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-warm/25 transition-colors"
        >
          <IconStar width={16} height={16} fill="currentColor" />
          On watchlist
        </button>
      </form>
    );
  }

  return (
    <form action={addWatchlistTicker}>
      <input type="hidden" name="ticker" value={ticker} />
      <button
        type="submit"
        className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-full text-sm font-semibold hover:border-warm hover:text-warm transition-colors"
      >
        <IconStar width={16} height={16} />
        Add to watchlist
      </button>
    </form>
  );
}
