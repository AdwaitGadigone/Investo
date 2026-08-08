import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { BOT_INVITE_URL } from "@/lib/config";

export default function NoServersPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <Wordmark className="text-3xl mb-8" />
      <h1 className="font-display text-3xl font-bold tracking-tight mb-3">
        Investo isn&apos;t in any of your servers yet
      </h1>
      <p className="text-text-muted max-w-sm mb-8">
        Your Discord account signed in fine, but the bot needs to actually be in a
        server before there&apos;s anything here for it. Add it to one, then sign in
        again.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href={BOT_INVITE_URL}
          className="bg-discord text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-discord-hover transition-colors shadow-lg shadow-discord/20"
        >
          Add to Discord
        </a>
        <Link href="/login" className="text-sm text-discord hover:underline">
          Sign in again
        </Link>
      </div>
    </div>
  );
}
