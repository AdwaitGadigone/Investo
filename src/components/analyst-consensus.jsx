import { generateAnalystTake } from "@/lib/ai/analyst-take";
import { Tooltip } from "@/components/tooltip";
import { IconSparkle } from "@/components/icons";

// An async Server Component on purpose, not called inline in the page, this is what lets
// it be wrapped in <Suspense> so the Gemini call (the slowest thing on this whole page,
// several seconds) streams in after everything else instead of blocking the entire page.
export async function AnalystConsensus({ ticker, quote, trends, news }) {
  if (!trends) return null;

  const buyTotal = trends.strongBuy + trends.buy;
  const sellTotal = trends.sell + trends.strongSell;
  const trendsTotal = buyTotal + trends.hold + sellTotal;
  if (trendsTotal === 0) return null;

  const analystTake = await generateAnalystTake(ticker, quote.name, quote, trends, news);

  return (
    <div className="glass rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted font-semibold">
          Analyst Consensus
        </p>
        <Tooltip text="What Wall Street analysts covering this stock are currently recommending" />
      </div>
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-border">
        <div className="bg-gain" style={{ width: `${(buyTotal / trendsTotal) * 100}%` }} />
        <div className="bg-text-muted" style={{ width: `${(trends.hold / trendsTotal) * 100}%` }} />
        <div className="bg-loss" style={{ width: `${(sellTotal / trendsTotal) * 100}%` }} />
      </div>
      <div className="flex gap-6 font-mono text-sm mb-5">
        <span className="text-gain">{buyTotal} Buy</span>
        <span className="text-text-muted">{trends.hold} Hold</span>
        <span className="text-loss">{sellTotal} Sell</span>
      </div>

      {analystTake && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-2">
            <IconSparkle width={13} height={13} className="text-warm" />
            <p className="text-xs font-semibold text-warm uppercase tracking-widest">AI Take</p>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">{analystTake}</p>
        </div>
      )}
    </div>
  );
}

export function AnalystConsensusSkeleton() {
  return (
    <div className="glass rounded-lg p-6 mb-8 animate-pulse">
      <div className="h-3 w-40 bg-border rounded mb-4" />
      <div className="h-3 rounded-full bg-border mb-4" />
      <div className="h-3 w-56 bg-border rounded" />
    </div>
  );
}
