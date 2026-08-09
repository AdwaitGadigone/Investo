import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { AppNav } from "@/components/app-nav";
import { Footer } from "@/components/footer";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Reveal } from "@/components/reveal";
import { BackButton } from "@/components/back-button";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { getOptionalDiscordUser } from "@/lib/auth/get-discord-user";
import { BOT_INVITE_URL } from "@/lib/config";
import {
  IconChart,
  IconBarChart,
  IconSparkle,
  IconLayers,
  IconStar,
  IconSync,
  IconWallet,
  IconBell,
  IconChat,
  IconInfo,
} from "@/components/icons";

// Mirrors Investobot's src/cogs/help.py SECTIONS, keep both in sync when a command changes.
const SECTIONS = [
  {
    icon: IconChart,
    color: "bg-discord/15 text-discord",
    title: "Quotes & Charts",
    commands: [
      {
        cmd: "/stock <ticker> [range]",
        body: "Price, day/52-week range, volume, market cap, a price+volume chart, and the analyst consensus, all in one embed. Range picks the chart window: 1D, 1W, 1M (default), 3M, 6M, YTD, 1Y, or 5Y.",
      },
    ],
  },
  {
    icon: IconBarChart,
    color: "bg-warm/15 text-warm",
    title: "Market Movers",
    commands: [
      {
        cmd: "/movers",
        body: "Today's (or this week's/month's/3 months'/year's/5 years') top gainers, top losers, and most active stocks, filtered to real, well-known companies. Toggle between the three with buttons, pick the time span from a dropdown, same data as the website's Market Movers panel.",
      },
    ],
  },
  {
    icon: IconSparkle,
    color: "bg-cool/15 text-cool",
    title: "Analyst Ratings",
    commands: [
      {
        cmd: "/rating <ticker>",
        body: "The full buy/hold/sell breakdown from Wall Street analysts, the average price target, and an AI-written take explaining why the rating looks the way it does.",
      },
    ],
  },
  {
    icon: IconLayers,
    color: "bg-gain/15 text-gain",
    title: "News",
    commands: [
      { cmd: "/news <ticker>", body: "The 5 most recent headlines for a ticker, each with a link to read more." },
    ],
  },
  {
    icon: IconStar,
    color: "bg-discord/15 text-discord",
    title: "Your Watchlist",
    subtitle: "Private, just for you",
    commands: [
      {
        cmd: "/watchlist add <tickers>",
        body: "Add one or more tickers to your own list, separate multiple with commas or spaces, e.g. AAPL, MSFT, NVDA.",
      },
      { cmd: "/watchlist remove <ticker>", body: "Take one off." },
      { cmd: "/watchlist list", body: "Show what's on it." },
    ],
  },
  {
    icon: IconSync,
    color: "bg-warm/15 text-warm",
    title: "Server Tracked List",
    subtitle: "Shared by everyone",
    commands: [
      {
        cmd: "/track add <tickers>",
        body: "Add one or more tickers to the server-wide list, this is what the automatic updates below actually scan.",
      },
      { cmd: "/track remove <ticker>", body: "Stop tracking a ticker." },
      { cmd: "/track list", body: "Show what the server is tracking." },
    ],
  },
  {
    icon: IconWallet,
    color: "bg-cool/15 text-cool",
    title: "Your Portfolio",
    subtitle: "Shares you actually own",
    commands: [
      {
        cmd: "/portfolio buy <ticker> <shares> <price>",
        body: "Log a buy, blends into your average cost if you already hold some.",
      },
      { cmd: "/portfolio sell <ticker> <shares>", body: "Log a sell, reduces or closes the position." },
      {
        cmd: "/portfolio edit <ticker> [shares] [avg_cost]",
        body: "Correct the share count or average cost directly, no blending, for fixing a typo'd entry.",
      },
      { cmd: "/portfolio remove <ticker>", body: "Fully clear a position." },
      { cmd: "/portfolio view", body: "See every holding with live profit/loss, plus your totals." },
    ],
  },
  {
    icon: IconBell,
    color: "bg-gain/15 text-gain",
    title: "Alerts & Notifications",
    commands: [
      {
        cmd: "/alert set <ticker> <above/below> <price>",
        body: "Get DM'd the moment a ticker crosses that price.",
      },
      { cmd: "/alert list", body: "Show your alerts and their ID numbers." },
      { cmd: "/alert remove <alert_id>", body: "Cancel one." },
      { cmd: "/notify", body: "Toggle the Stock Alerts role, anyone with it gets pinged on automatic updates." },
      {
        cmd: "/digest [content]",
        body: "Toggle a daily DM summarizing your watchlist, portfolio, or both. A dropdown right on the DM lets you switch what it shows afterward too.",
      },
      {
        cmd: "/serverdigest set | off",
        body: "Admin-only (Manage Server). Posts a daily digest of the server's tracked list to a channel of your choice, with a switchable time window and a section flagging other big movers.",
      },
    ],
  },
  {
    icon: IconChat,
    color: "bg-discord/15 text-discord",
    title: "Ask Me Anything",
    commands: [
      {
        cmd: "@ mention the bot",
        body: "Ask about a stock, investing in general, or reply to its message to keep a follow-up thread going, it answers using an AI that pulls in live prices for any ticker you mention.",
      },
    ],
  },
  {
    icon: IconInfo,
    color: "bg-warm/15 text-warm",
    title: "Feedback & Status",
    commands: [
      {
        cmd: "/feedback <message> [category]",
        body: "Send a bug report, suggestion, or general feedback straight to the bot owner.",
      },
      {
        cmd: "/status",
        body: "Checks Discord latency, the database, Yahoo Finance, and today's Gemini usage, shows what's actually responding right now.",
      },
    ],
  },
];

export default async function BotPage() {
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
          <DiscordSignInButton className="flex items-center gap-2 bg-discord text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-discord-hover transition-colors" />
        </header>
      )}

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-16">
        <GradientBlobs variant="features" />

        <div className="max-w-3xl mx-auto">
          <BackButton className="mb-6" />
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <p className="font-mono text-xs uppercase tracking-widest text-warm">The Bot</p>
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-discord text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-discord-hover transition-colors"
            >
              Add to Discord
            </a>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Everything Investo can do.
          </h1>
          <p className="text-text-muted leading-relaxed mb-10">
            Every slash command, in one place. Anything here works the same in a server or in a
            DM with the bot directly.
          </p>

          <div className="flex flex-col gap-5">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.title} delay={Math.min(i * 0.04, 0.3)}>
                  <div className="glass rounded-lg p-6 hover:border-discord hover:-translate-y-1 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${section.color}`}>
                        <Icon width={16} height={16} />
                      </span>
                      <h2 className="font-display text-lg font-bold tracking-tight">{section.title}</h2>
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-text-muted ml-12 mb-4">{section.subtitle}</p>
                    )}
                    <div className={`flex flex-col gap-3 ${section.subtitle ? "" : "mt-4"}`}>
                      {section.commands.map((c) => (
                        <div key={c.cmd}>
                          <code className="font-mono text-sm text-warm">{c.cmd}</code>
                          <p className="text-sm text-text-muted leading-relaxed mt-1">{c.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.4} className="mt-8">
            <div className="glass rounded-lg p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-lg font-bold tracking-tight mb-1">
                  Automatic updates, no command needed
                </p>
                <p className="text-sm text-text-muted leading-relaxed max-w-md">
                  Every 15 minutes, Investo checks the server's tracked list for big moves (5%+)
                  and posts them to a channel the server owner picked, plus a fixed list of
                  well-known tickers for genuinely wild moves (15%+) even if nobody's tracking
                  them.
                </p>
              </div>
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
