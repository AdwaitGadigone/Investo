import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { TickerMarquee } from "@/components/ticker-marquee";
import { HowItWorks } from "@/components/how-it-works";
import { StatsStrip } from "@/components/stats-strip";
import { FeatureStrip } from "@/components/feature-strip";
import { BottomCta } from "@/components/bottom-cta";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { MobileMenu } from "@/components/mobile-menu";
import { getPreviewQuotes } from "@/lib/market/get-preview-quotes";
import { getOptionalDiscordUser } from "@/lib/auth/get-discord-user";
import { BOT_INVITE_URL } from "@/lib/config";

export default async function Home() {
  const [quotes, user] = await Promise.all([getPreviewQuotes(), getOptionalDiscordUser()]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="glass-overlay sticky top-0 z-40 px-6 py-5 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <MobileMenu
            links={[
              { href: "/bot", label: "Bot commands" },
              { href: "/about", label: "About" },
              { href: BOT_INVITE_URL, label: "Add the bot to your server", external: true },
            ]}
          />
          <Wordmark className="text-xl" />
        </div>
        <div className="flex items-center gap-5">
          <Link href="/bot" className="hidden sm:inline text-sm text-text-muted hover:text-text transition-colors">
            Bot commands
          </Link>
          <Link href="/about" className="hidden sm:inline text-sm text-text-muted hover:text-text transition-colors">
            About
          </Link>
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline text-sm text-text-muted hover:text-text transition-colors"
          >
            Add the bot to your server
          </a>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-discord text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-discord-hover transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Continue</span>
              <span className="hidden sm:inline">Continue as {user.username}</span>
            </Link>
          ) : (
            <DiscordSignInButton className="flex items-center gap-2 bg-discord text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-discord-hover transition-colors" />
          )}
        </div>
      </header>

      <TickerMarquee />
      <Hero quotes={quotes} user={user} />
      <HowItWorks />
      <StatsStrip />
      <FeatureStrip />
      <BottomCta user={user} />
      <Footer />
    </div>
  );
}
