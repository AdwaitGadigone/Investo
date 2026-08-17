import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getActiveAlerts } from "@/lib/db";
import { getQuotes } from "@/lib/market/get-quotes";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { AppNav } from "@/components/app-nav";
import { GradientBlobs } from "@/components/gradient-blobs";
import { TickerAutocomplete } from "@/components/ticker-autocomplete";
import { addAlertAction, removeAlertAction } from "@/lib/actions/alerts";
import { IconX } from "@/components/icons";

export default async function AlertsPage() {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const alerts = await getActiveAlerts(guildId, discordId);

  // Not personal-scoped, just current prices for context next to each target, dedupe in case of 2 alerts on 1 ticker.
  const tickers = [...new Set(alerts.map((a) => a.ticker))];
  const quotes = await getQuotes(tickers);
  const quoteByTicker = Object.fromEntries(quotes.map((q) => [q.ticker, q]));

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="features" />

        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-discord mb-3">
            Alerts
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Your price alerts.
          </h1>
          <p className="text-text-muted mb-10">
            Same alerts as <code className="font-mono text-warm">/alert list</code> in Discord,
            get DM&apos;d the moment one triggers either way, set here or there.
          </p>

          <form action={addAlertAction} className="flex flex-wrap gap-3 mb-12 glass rounded-lg p-4">
            <TickerAutocomplete
              name="ticker"
              placeholder="Ticker"
              className="flex-1 min-w-24 bg-bg border border-border rounded-md px-3 py-2 font-mono uppercase text-sm placeholder:font-sans placeholder:normal-case placeholder:text-text-muted/60 focus:outline-none focus:border-discord transition-colors"
            />
            <select
              name="direction"
              required
              defaultValue="above"
              className="bg-bg border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-discord transition-colors"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input
              type="number"
              step="any"
              name="target_price"
              placeholder="Target price"
              required
              className="w-32 bg-bg border border-border rounded-md px-3 py-2 font-mono text-sm placeholder:font-sans placeholder:text-text-muted/60 focus:outline-none focus:border-discord transition-colors"
            />
            <button
              type="submit"
              className="bg-discord text-white font-semibold px-5 py-2 rounded-md hover:bg-discord-hover transition-colors text-sm"
            >
              Set alert
            </button>
          </form>
        </div>

        {alerts.length === 0 ? (
          <div className="max-w-2xl border border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-text-muted mb-1">No active alerts yet.</p>
            <p className="text-sm text-text-muted">
              Set one above, or use <code className="font-mono text-warm">/alert set</code> in Discord.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl grid gap-3">
            {alerts.map((alert) => {
              const quote = quoteByTicker[alert.ticker];
              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between glass rounded-lg px-5 py-4"
                >
                  <div>
                    <p className="font-mono font-semibold">{alert.ticker}</p>
                    <p className="text-sm text-text-muted">
                      Alert when {alert.direction}{" "}
                      <span className="font-mono text-text">${alert.target_price.toFixed(2)}</span>
                      {quote?.price != null && (
                        <>
                          {" "}
                          &middot; now{" "}
                          <span className="font-mono text-text">${quote.price.toFixed(2)}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <form action={removeAlertAction}>
                    <input type="hidden" name="alert_id" value={alert.id} />
                    <button
                      type="submit"
                      className="text-text-muted hover:text-loss w-8 h-8 flex items-center justify-center rounded-full hover:bg-loss/10 transition-colors"
                      aria-label={`Remove alert for ${alert.ticker}`}
                    >
                      <IconX width={16} height={16} />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
