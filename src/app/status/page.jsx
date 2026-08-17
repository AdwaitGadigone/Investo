import { getBotHeartbeat, pingDatabase } from "@/lib/db";
import { Wordmark } from "@/components/wordmark";
import { GradientBlobs } from "@/components/gradient-blobs";
import { BackButton } from "@/components/back-button";

// Anything past this many minutes without a heartbeat means the bot process is down or hung, not just mid-cycle.
const HEARTBEAT_STALE_MINUTES = 5;

function StatusRow({ label, ok, detail }) {
  return (
    <div className="flex items-center justify-between glass rounded-lg px-5 py-4">
      <div>
        <p className="font-semibold">{label}</p>
        {detail && <p className="text-xs text-text-muted mt-0.5">{detail}</p>}
      </div>
      <span
        className={`flex items-center gap-2 text-sm font-mono font-semibold ${ok ? "text-gain" : "text-loss"}`}
      >
        <span className={`w-2 h-2 rounded-full ${ok ? "bg-gain" : "bg-loss"}`} />
        {ok ? "Online" : "Down"}
      </span>
    </div>
  );
}

export default async function StatusPage() {
  const [dbOk, heartbeat] = await Promise.all([pingDatabase(), getBotHeartbeat()]);

  const minutesSinceHeartbeat = heartbeat ? (Date.now() - new Date(heartbeat).getTime()) / 60000 : null;
  const botOk = minutesSinceHeartbeat != null && minutesSinceHeartbeat < HEARTBEAT_STALE_MINUTES;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <GradientBlobs variant="features" />
      <div className="w-full max-w-md relative">
        <BackButton className="mb-6" />
        {/* Wordmark is an inline span, needs an actual flex wrapper to center, "justify-center" on it alone is a no-op. */}
        <div className="flex justify-center mb-8">
          <Wordmark className="text-2xl" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-6 text-center">System Status</h1>

        <div className="grid gap-3">
          <StatusRow label="Website" ok detail="You're looking at it" />
          <StatusRow label="Database" ok={dbOk} detail="Supabase" />
          <StatusRow
            label="Discord bot"
            ok={botOk}
            detail={
              minutesSinceHeartbeat != null
                ? `Last check-in ${Math.round(minutesSinceHeartbeat)} min ago`
                : "No check-in recorded yet"
            }
          />
        </div>

        <p className="text-xs text-text-muted text-center mt-8">
          The bot checks in every 2 minutes, so a gap under {HEARTBEAT_STALE_MINUTES} minutes is normal, not an outage.
        </p>
      </div>
    </div>
  );
}
