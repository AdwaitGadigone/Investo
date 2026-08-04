import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileMenu } from "@/components/mobile-menu";

// Invite lives on the Bot page itself now (top-right button), not as a separate nav link.
const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/news", label: "News" },
  { href: "/bot", label: "Bot" },
  { href: "/about", label: "About" },
];

export function AppNav() {
  return (
    <header className="glass-overlay sticky top-0 z-40 px-6 py-5 flex items-center justify-between relative">
      <div className="flex items-center gap-4 sm:gap-10">
        <MobileMenu links={LINKS} />
        <Link href="/">
          <Wordmark className="text-xl" />
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <SignOutButton className="border border-border px-4 py-2 text-sm font-medium rounded-full hover:border-discord hover:text-discord transition-colors" />
    </header>
  );
}
