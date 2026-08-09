import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Footer } from "@/components/footer";
import { AppNav } from "@/components/app-nav";
import { GradientBlobs } from "@/components/gradient-blobs";
import { BackButton } from "@/components/back-button";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { getOptionalDiscordUser } from "@/lib/auth/get-discord-user";

export default async function PrivacyPage() {
  const user = await getOptionalDiscordUser();

  return (
    <div className="flex flex-col min-h-screen">
      {user ? (
        <AppNav />
      ) : (
        <header className="glass-overlay sticky top-0 z-40 px-6 py-5 flex items-center justify-between">
          <Link href="/">
            <Wordmark className="text-xl" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/bot" className="text-sm text-text-muted hover:text-text transition-colors">
              Bot
            </Link>
            <DiscordSignInButton className="flex items-center gap-2 bg-discord text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-discord-hover transition-colors" />
          </div>
        </header>
      )}

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="features" />

        <div className="max-w-3xl mx-auto">
          <BackButton className="mb-6" />
          <p className="font-mono text-xs uppercase tracking-widest text-warm mb-3">Privacy Policy</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            What we collect, and why.
          </h1>
          <p className="text-text-muted leading-relaxed mb-10">
            Last updated August 2026. This covers both the Investo Discord bot and this
            website, same data either way. Written in plain language on purpose, ask if
            anything here isn't clear.
          </p>

          <div className="space-y-10 text-text-muted leading-relaxed">
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                What we collect
              </h2>
              <ul className="space-y-2">
                <li>
                  <span className="text-text font-semibold">From Discord:</span> your
                  Discord ID, username, and avatar when you sign in or use the bot. We
                  also check which of your own Discord servers have Investo added, so
                  the site knows which one's data to show you.
                </li>
                <li>
                  <span className="text-text font-semibold">What you enter yourself:</span>{" "}
                  watchlist tickers, portfolio positions (ticker, share count, cost
                  basis), price alerts, and digest preferences. This is financial
                  information you choose to add, we don't pull it from anywhere else.
                </li>
                <li>
                  <span className="text-text font-semibold">Messages, only when you use the AI features:</span>{" "}
                  if you @ mention the bot or ask for an analyst take, that message text
                  is sent to Google's Gemini API to generate a reply. We don't keep a
                  separate log of these conversations ourselves.
                </li>
                <li>
                  <span className="text-text font-semibold">Basic site usage:</span> page
                  views through Vercel Analytics, which doesn't use cookies or track you
                  individually.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Who else sees it
              </h2>
              <ul className="space-y-2">
                <li>
                  <span className="text-text font-semibold">Google Gemini</span>: the
                  text of your question or the data behind an AI-written take, only when
                  you actually trigger that feature.
                </li>
                <li>
                  <span className="text-text font-semibold">Yahoo Finance / Finnhub</span>:
                  ticker symbols only, to look up prices and news, never anything tied
                  to your identity.
                </li>
                <li>
                  <span className="text-text font-semibold">Supabase</span>: hosts our
                  database, everything listed above lives there.
                </li>
                <li>
                  <span className="text-text font-semibold">Vercel</span>: hosts this
                  website.
                </li>
              </ul>
              <p className="mt-3">
                We don't sell your data, and we don't share it with anyone beyond what's
                needed to run the features above.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Your controls
              </h2>
              <p>
                Remove a watchlist ticker, portfolio position, or alert anytime, on the
                site or with the matching Discord command, it's deleted immediately, not
                just hidden. Revoke Investo's access to your Discord account entirely
                from Discord's own Settings → Authorized Apps. To have all of your data
                deleted outright, reach out to the bot owner on Discord.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Kids
              </h2>
              <p>
                Investo isn't intended for anyone under 13, or under whatever the
                minimum age is where you live, matching Discord's own rules.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Changes
              </h2>
              <p>
                If this changes in a real way, the "last updated" date at the top of
                this page will change with it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Contact
              </h2>
              <p>
                Questions about any of this, reach the bot owner on Discord.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
