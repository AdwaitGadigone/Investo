import { DiscordSignInButton } from "@/components/discord-sign-in-button";

// Shared empty-state for any personal section (watchlist, portfolio, alerts) shown to a signed-out visitor,
// same dashed-card shape the real empty states already use, just with a sign-in CTA instead of an action hint.
export function SignInPrompt({ title, body, className = "" }) {
  return (
    <div className={`border border-dashed border-border rounded-lg p-8 text-center ${className}`}>
      <p className="text-text-muted mb-1">{title}</p>
      {body && <p className="text-sm text-text-muted mb-4">{body}</p>}
      <DiscordSignInButton className="inline-flex items-center gap-2 bg-discord text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-discord-hover transition-colors mt-3" />
    </div>
  );
}
