import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Footer } from "@/components/footer";
import { AppNav } from "@/components/app-nav";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Reveal } from "@/components/reveal";
import { BackButton } from "@/components/back-button";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { getOptionalDiscordUser } from "@/lib/auth/get-discord-user";
import { BOT_INVITE_URL } from "@/lib/config";

const SOURCES = [
  {
    name: "Yahoo Finance",
    body: "Price history for every chart, market indices, the gainers/losers/most active/related-tickers panels, and price/change for anything Finnhub doesn't cover.",
  },
  {
    name: "Finnhub",
    body: "Company news, the analyst buy/hold/sell consensus, and real-time (not delayed) price/change for US-listed stocks on ticker pages.",
  },
  {
    name: "Google Gemini",
    body: "Writes the AI \"take\" explaining why a stock's analyst rating looks the way it does, grounded only in the real data it's given, never invents facts.",
  },
  {
    name: "Supabase",
    body: "The database (Postgres), and handles signing in with Discord. This is the same database the Discord bot reads and writes to directly, that's the whole reason adding a ticker here shows up in Discord instantly and vice versa.",
  },
  {
    name: "Discord",
    body: "Sign-in, and the bot itself lives here. Which of your own servers show up on the site depends on which ones actually have Investo added.",
  },
];

const STACK = [
  "Next.js and React for the site itself",
  "Tailwind CSS for styling",
  "A custom \"liquid glass\" effect (blur + saturate), the frosted look on every card and nav bar",
  "Motion (Framer Motion) for the animations",
  "TradingView's Lightweight Charts for the price charts",
  "Python and discord.py for the bot side",
];

export default async function AboutPage() {
  const user = await getOptionalDiscordUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Logged-in visitors get the same full nav header as every other page. */}
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
          <p className="font-mono text-xs uppercase tracking-widest text-warm mb-3">
            About
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            What Investo actually is.
          </h1>
          <p className="text-text-muted leading-relaxed mb-4">
            Investo started as a Discord bot for tracking stocks, watchlists, price
            alerts, a daily digest, and a bot you can just @ mention with questions.
            Now it runs in any server that adds it. This site is the same thing on
            the web, same account, same data, nothing here is a separate copy of
            anything.
          </p>
          <p className="text-text-muted leading-relaxed mb-10">
            Built by{" "}
            <span className="text-text font-semibold">Adwait Gadigone</span>, with{" "}
            <a
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-discord hover:underline"
            >
              Claude Code
            </a>
            . Still actively growing, new features go in most weeks.
          </p>

          <Reveal delay={0.05}>
            <h2 className="font-display text-2xl font-bold tracking-tight mb-5">
              Where the data comes from
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {SOURCES.map((s) => (
                <div key={s.name} className="glass rounded-lg p-5">
                  <p className="font-semibold mb-1">{s.name}</p>
                  <p className="text-sm text-text-muted leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-5">
              What it's built with
            </h2>
            <div className="glass rounded-lg p-5">
              <ul className="grid gap-2 sm:grid-cols-2 text-sm text-text-muted">
                {STACK.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gain mt-1">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-5">
              Get the bot
            </h2>
            <div className="glass rounded-lg p-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-text-muted leading-relaxed max-w-md">
                Investo isn't locked to one server, invite it to yours and everything
                on this site works there too.
              </p>
              <a
                href={BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-discord text-white font-semibold px-5 py-2.5 rounded-full hover:bg-discord-hover transition-colors text-sm flex-shrink-0"
              >
                Add to Discord
              </a>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
