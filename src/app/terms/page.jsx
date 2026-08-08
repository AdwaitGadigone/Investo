import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Footer } from "@/components/footer";
import { AppNav } from "@/components/app-nav";
import { GradientBlobs } from "@/components/gradient-blobs";
import { BackButton } from "@/components/back-button";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { getOptionalDiscordUser } from "@/lib/auth/get-discord-user";

export default async function TermsPage() {
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
          <p className="font-mono text-xs uppercase tracking-widest text-warm mb-3">Terms of Service</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The short version, in plain terms.
          </h1>
          <p className="text-text-muted leading-relaxed mb-10">
            Last updated August 2026. Applies to both the Investo Discord bot and this
            website.
          </p>

          <div className="space-y-10 text-text-muted leading-relaxed">
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                What this is
              </h2>
              <p>
                Investo tracks stocks, crypto, and commodities, watchlists, portfolios,
                price alerts, and a daily digest, in Discord and on this site. Using
                either one means you're agreeing to these terms and to Discord's own
                Terms of Service and Community Guidelines, since the bot runs on top of
                Discord.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Not financial advice
              </h2>
              <p>
                Prices, charts, analyst ratings, and anything AI-generated (the
                "analyst take," chat replies) are for information only, not a
                recommendation to buy, sell, or hold anything. Market data comes from
                third parties and can be delayed or wrong. AI-generated text can be
                wrong too. Decide with your own judgment, or a licensed professional's,
                not this bot's.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Using it fairly
              </h2>
              <p>
                Don't try to abuse, spam, or break the bot or site, don't try to access
                anyone else's data, and don't use it for anything illegal. Access can be
                limited or removed for anyone who does.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                No guarantees
              </h2>
              <p>
                This is provided as-is, with no warranty that it'll always be
                available, accurate, or error-free. It runs on free tiers of several
                third-party services, so features can be temporarily limited or
                unavailable if those get hit hard. We're not liable for losses tied to
                using it, including financial decisions made based on anything it
                shows you.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Changes
              </h2>
              <p>
                Features can change or go away, and these terms can be updated, the
                "last updated" date at the top will reflect it when they do.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-3">
                Contact
              </h2>
              <p>
                Questions about these terms, reach the bot owner on Discord.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
