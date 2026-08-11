import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono, Anton } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// A display font with real personality, not another "Inter alternative" every AI tool uses.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Big, bold, poster-style, an Impact-like face reserved for just the hero headline.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

// Clean and warm for body/UI text, pairs with Bricolage without competing with it.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

// Monospace for prices/tickers so digits line up instead of jittering as they update.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const DESCRIPTION =
  "Track stocks, crypto, and more, in Discord and on the web. Watchlists, portfolios, price alerts, and a daily digest, synced instantly either way.";

// This version of Next.js splits colorScheme out of metadata into its own viewport export.
export const viewport = {
  // Dark is the only theme now, this hints browser-native chrome (scrollbars, form controls) to
  // match instead of rendering light, which fought the page even after the CSS itself went dark-only.
  colorScheme: "dark",
};

export const metadata = {
  metadataBase: new URL("https://investoweb.vercel.app"),
  title: {
    default: "Investo",
    // %s lets a page override just its own piece, e.g. a ticker page could become "AAPL · Investo".
    template: "%s · Investo",
  },
  description: DESCRIPTION,
  keywords: ["Discord bot", "stock tracker", "crypto tracker", "watchlist", "portfolio tracker", "price alerts"],
  openGraph: {
    title: "Investo",
    description: DESCRIPTION,
    url: "https://investoweb.vercel.app",
    siteName: "Investo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investo",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrumentSans.variable} ${ibmPlexMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
