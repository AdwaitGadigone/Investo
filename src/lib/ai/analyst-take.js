import "server-only";
import { GoogleGenAI } from "@google/genai";

// Direct port of Investobot's services/analyst_take.py, same prompt on both bot and site.
const client = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const SYSTEM_PROMPT =
  "You write short, plain-English stock analysis summaries for casual investors, not " +
  "professionals. You'll get the current price and today's change, the " +
  "analyst buy/hold/sell consensus, a price target if one exists, and a few recent news " +
  "headlines. In 3-4 sentences: explain why the consensus looks the way it does, mention " +
  "anything in the news that explains the current price move, and end with one thing worth " +
  "watching going forward. Only use facts you were actually given, never invent a specific " +
  "date, event, or number that wasn't provided. If the news doesn't explain the rating, say " +
  "the rating reflects analysts' longer-term view instead of guessing why. Casual tone, no " +
  "bullet points, no headers, just a short paragraph. Never use em dashes, use commas, " +
  "periods, or parentheses instead.";

function buildPrompt(ticker, name, quote, trends, news) {
  const lines = [
    `Ticker: ${ticker} (${name})`,
    `Price: $${quote.price.toFixed(2)}, ${quote.changePct >= 0 ? "+" : ""}${quote.changePct?.toFixed(2)}% today`,
  ];

  if (trends) {
    lines.push(
      `Analyst consensus: ${trends.strongBuy ?? 0} strong buy, ${trends.buy ?? 0} buy, ` +
        `${trends.hold ?? 0} hold, ${trends.sell ?? 0} sell, ${trends.strongSell ?? 0} strong sell`
    );
  } else {
    lines.push("Analyst consensus: not available");
  }

  lines.push("Average price target: not available");

  if (news.length > 0) {
    lines.push("Recent headlines:");
    for (const article of news.slice(0, 5)) {
      lines.push(`- ${article.headline ?? "Untitled"} (${article.source ?? "unknown source"})`);
    }
  } else {
    lines.push("Recent headlines: none available");
  }

  return lines.join("\n");
}

// Caches the take per ticker (text + expiry) so a re-visited page costs zero extra Gemini calls, expires hourly.
const takeCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

// Backstop against burning through the free tier's quota (10 calls/min across everyone), whether by accident or abuse.
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;
let callTimestamps = [];

function isRateLimited() {
  const now = Date.now();
  callTimestamps = callTimestamps.filter((t) => now - t < RATE_WINDOW);
  if (callTimestamps.length >= RATE_LIMIT) return true;
  callTimestamps.push(now);
  return false;
}

export async function generateAnalystTake(ticker, name, quote, trends, news) {
  if (!client) return null;

  const cached = takeCache.get(ticker);
  if (cached && Date.now() < cached.expires) return cached.text;

  if (isRateLimited()) return null;

  try {
    const response = await client.models.generateContent({
      model: "gemini-flash-latest",
      contents: buildPrompt(ticker, name, quote, trends, news),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        // Covers both the answer and Gemini's internal "thinking" tokens, which share this budget.
        maxOutputTokens: 2048,
      },
    });
    const text = response.text?.trim() || null;
    if (text) {
      // Prunes expired entries on write instead of a separate cleanup task, keeps this map from growing forever.
      for (const [key, value] of takeCache) {
        if (Date.now() >= value.expires) takeCache.delete(key);
      }
      takeCache.set(ticker, { text, expires: Date.now() + CACHE_TTL });
    }
    return text;
  } catch {
    // The rest of the ticker page should still work fine, just skip this one section.
    return null;
  }
}
