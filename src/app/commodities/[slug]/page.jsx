import { notFound } from "next/navigation";
import { getQuote } from "@/lib/market/yahoo";
import { getCommodityBySlug } from "@/lib/market/commodities-config";
import { AppNav } from "@/components/app-nav";
import { Footer } from "@/components/footer";
import { GradientBlobs } from "@/components/gradient-blobs";
import { Reveal } from "@/components/reveal";
import { BackButton } from "@/components/back-button";
import { TradingViewChart } from "@/components/tradingview-chart";

// Only notFound()s for a genuinely invalid slug, the chart below never needs our own data.
export const dynamic = "force-dynamic";

export default async function CommodityPage({ params }) {
  const { slug } = await params;
  const commodity = getCommodityBySlug(slug);
  if (!commodity) notFound();

  const quote = await getQuote(commodity.ticker).catch(() => null);
  const up = quote?.changePct != null && quote.changePct >= 0;

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="relative flex-1 overflow-hidden px-6 md:px-12 lg:px-16 py-12">
        <GradientBlobs variant="features" />

        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-6" />

          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-text-muted mb-2">
                Commodity &middot; per {commodity.unit}
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight">
                {commodity.label}
              </h1>
              {quote && (
                <>
                  <div className="flex flex-wrap items-baseline gap-4 mt-2">
                    <span className="font-mono text-3xl">${quote.price.toFixed(2)}</span>
                  </div>
                  {quote.change != null && (
                    <p className={`font-mono text-lg mt-2 ${up ? "text-gain" : "text-loss"}`}>
                      {up ? "+" : ""}
                      {quote.change.toFixed(2)} ({up ? "+" : ""}
                      {quote.changePct.toFixed(2)}%) today
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <Reveal>
            <div className="glass rounded-lg p-4 mb-4 overflow-hidden">
              <TradingViewChart symbol={commodity.tvSymbol} />
            </div>
            <p className="text-xs text-text-muted">
              Chart and time-span picker (1D, 1W, 1M, and beyond, top-left of the chart) from
              TradingView, Yahoo Finance doesn't carry deep enough futures history for these to
              chart the same way stocks do on this site.
            </p>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}
