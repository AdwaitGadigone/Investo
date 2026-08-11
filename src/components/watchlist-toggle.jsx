import Link from "next/link";
import { addWatchlistTicker, removeWatchlistTicker } from "@/lib/actions/watchlist";
import { IconStar } from "@/components/icons";

// Plain form + Server Action, works without client JS, same pattern as the watchlist page.
export function WatchlistToggle({ ticker, isWatchlisted, loggedIn = true }) {
  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-full text-sm font-semibold hover:border-warm hover:text-warm transition-colors"
      >
        <IconStar width={16} height={16} />
        Sign in to add
      </Link>
    );
  }

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
