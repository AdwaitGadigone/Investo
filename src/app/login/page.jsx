import { Wordmark } from "@/components/wordmark";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <Wordmark className="text-3xl mb-8" />
      <h1 className="font-display text-3xl font-bold tracking-tight mb-3">
        Sign in to continue
      </h1>
      <p className="text-text-muted max-w-sm mb-8">
        One click with the Discord account you already use in the server, no separate
        password to make up.
      </p>
      <DiscordSignInButton className="flex items-center gap-3 bg-discord text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-discord-hover transition-colors shadow-lg shadow-discord/20" />
    </div>
  );
}
