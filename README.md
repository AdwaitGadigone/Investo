# Investo

**Live site: [investoweb.vercel.app](https://investoweb.vercel.app)**

Investo is a stock and crypto tracker that lives in two places at once: a Discord bot and this
website, both reading and writing the same data. Add a ticker to your watchlist on the site and
it's there in Discord a second later, and the other way around. There's no separate account to
create, signing in here is just Discord OAuth. Works for any server that has the bot added, not
just one, sign in and pick which of your servers to view if you're in more than one.

## What it does

- **Watchlist**: track tickers, live prices, and daily % / $ change
- **Portfolio**: log buys and sells, weighted-average cost basis, live profit/loss, a value
  chart over time, edit a position directly if you fat-fingered a share count. Shows and sums
  correctly across tickers listed in different currencies, and across long and short positions
  opened from the bot
- **Price alerts & daily digest**: set alerts and get a DM'd morning summary from the bot,
  switch what it includes right from a dropdown on the DM, viewable on the site too, not DM-only
- **Server digest**: admins can turn on a daily digest of the whole server's tracked list,
  posted to a channel, with a switchable time window and a notable-movers callout
- **Market Movers**: today's (or this week's/month's/3 months'/year's/5 years') top gainers,
  top losers, and most active stocks
- **Top Performers**: the same time-span ranking, applied to a broader "most active" universe
- **Crypto**: a dedicated strip for popular coins, kept separate from stocks on purpose
- **News & analyst ratings**: recent headlines and the Wall Street buy/hold/sell consensus for
  any ticker, plus an AI-written take explaining *why* the rating looks the way it does
- **Search**: autocomplete by company or asset name, not just the exact ticker, with exchange
  and asset type shown next to each result so a search like "BTC" doesn't mix up the actual
  cryptocurrency with a similarly-named ETF
- **Commodities**: gold, silver, oil, and natural gas, surfaced directly since they barely show
  up in normal ticker search
- **CDR support**: Canadian Depositary Receipts and other CAD-hedged tickers are searchable,
  priced, and charted correctly
- **Status page**: `/status`, a plain look at whether the site, database, and bot are actually up

## The Discord bot

The bot (`/Investobot`) is where all of this started. It runs the same underlying data (Supabase
Postgres) as the website and supports:

- `/stock <ticker>` / `/compare <ticker1> <ticker2>`: quote, chart, and analyst consensus, for
  one ticker or two side by side
- `/movers`: today's (or any other time span's) top gainers, losers, and most active, with
  buttons to switch categories and a dropdown to change the time span
- `/watchlist` / `/track` / `/portfolio` / `/alert` / `/digest` / `/serverdigest`: the same
  features as the site, usable straight from Discord. The bot's `/portfolio` also supports
  shorting (`short` / `cover`, not available on the site yet) and `/currency` lets you display
  everything converted into a currency of your choice on top of each ticker's native one. DM
  the bot the word "digest" for an on-demand summary too, since slash commands don't work in DMs
- `/rating`, `/sentiment`, `/company_overview`, `/news`: analyst ratings, AI-read news
  sentiment, business/valuation fundamentals, and headlines, for any ticker
- Every command that takes a ticker autocompletes by name, not just the exact symbol
- `/feedback`: send a bug report or suggestion straight to the owner
- `/status`: check whether Discord, the database, Yahoo Finance, and Gemini are actually responding
- @ mention the bot with a question and it'll answer using an AI that pulls in live prices for
  whatever ticker you mention
- Posts a welcome message with a quick-start guide the moment it's added to a new server

Invite it to your own server from the [About page](https://investoweb.vercel.app/about) on
the site.

## Stack

- **Site**: Next.js (App Router) + React, plain JavaScript (no TypeScript), Tailwind CSS,
  Framer Motion, TradingView's Lightweight Charts
- **Bot**: Python, discord.py
- **Shared data**: Supabase (Postgres), same database both the site and bot read/write directly
- **Market data**: Yahoo Finance (charts, fundamentals, anything Finnhub doesn't cover), Finnhub
  (news, analyst trends, and real-time price/change for US-listed stocks)
- **AI**: Google Gemini, for the analyst "take" and the bot's chat feature, rate-limited so usage
  never spills into a paid tier
- **Auth**: Discord OAuth via Supabase Auth, works for any server the bot is actually in

## Local development

```bash
npm install
npm run dev
```

Needs a `.env.local` with Supabase, Discord, Finnhub, and Gemini credentials (see
`src/lib/config.js` for what's read where). Not committed, ask for a copy if you're setting this
up fresh.

## Deploying

Hosted on Vercel, connected to this repo. Pushes to `main` deploy automatically. Environment
variables are set in the Vercel project settings, not committed anywhere.
