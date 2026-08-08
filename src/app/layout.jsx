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

export const metadata = {
  title: "Investo",
  description: "Live quotes, portfolios, and watchlists, synced straight from Discord.",
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
