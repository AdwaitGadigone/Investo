import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// A real display font with actual personality for headlines, deliberately not one of the
// "distinctive alternative to Inter" fonts every AI tool has converged on lately.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Clean and warm for body/UI text, pairs with Bricolage without competing with it.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

// A dedicated monospace for prices and tickers, so digits line up in tables instead of
// jittering as they update, the same trick real trading products use.
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
      className={`${bricolage.variable} ${instrumentSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
