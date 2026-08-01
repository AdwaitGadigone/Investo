# Investo

**Live site: [investoweb.vercel.app](https://investoweb.vercel.app)**

Investo is a stock and crypto tracker that lives in two places at once: a Discord bot and this
website, both reading and writing the same data. Add a ticker to your watchlist on the site and
it's there in Discord a second later, and the other way around. There's no separate account to
create, signing in here is just Discord OAuth, gated to members of the server the bot runs in.

## What it does

- **Watchlist** — track tickers, live prices, and daily % / $ change
- **Portfolio** — log buys and sells, weighted-average cost basis, live profit/loss
- **Price alerts & daily digest** — set alerts and get a DM'd morning summary from the bot; the
  digest is viewable on the site too, not DM-only
- **Market Movers** — today's (or this week's/month's/3 months'/year's/5 years') top gainers,
  top losers, and most active stocks
- **Top Performers** — the same time-span ranking, applied to a broader "most active" universe
- **News & analyst ratings** — recent headlines and the Wall Street buy/hold/sell consensus for
  any ticker, plus an AI-written take explaining *why* the rating looks the way it does
- **Search** — autocomplete across stocks, crypto, and commodities, with exchange and currency
  shown so a Toronto-listed stock in CAD doesn't get mistaken for a USD price
- **Commodities** — gold, silver, oil, and natural gas, surfaced directly since they barely show
  up in normal ticker search

## The Discord bot

The bot (`/Investobot`) is where all of this started. It runs the same underlying data (Supabase
Postgres) as the website and supports:

- `/stock <ticker>` — quote, chart, and analyst consensus in one embed
- `/movers` — today's (or any other time span's) top gainers, losers, and most active, with
  buttons to switch categories and a dropdown to change the time span
- `/watchlist` / `/track` / `/portfolio` / `/alert` / `/digest` — the same features as the site,
  usable straight from Discord
- `/rating`, `/news` — analyst ratings and headlines for any ticker
- @ mention the bot with a question and it'll answer using an AI that pulls in live prices for
  whatever ticker you mention

Invite it to your own server from the [About page](https://investoweb.vercel.app/about) on
the site.

## Stack

- **Site**: Next.js (App Router) + React, plain JavaScript (no TypeScript), Tailwind CSS,
  Framer Motion, TradingView's Lightweight Charts
- **Bot**: Python, discord.py
- **Shared data**: Supabase (Postgres), same database both the site and bot read/write directly
- **Market data**: Yahoo Finance, Finnhub (news & analyst trends)
- **AI**: Google Gemini, for the analyst "take" and the bot's chat feature
- **Auth**: Discord OAuth via Supabase Auth, gated to actual members of the server

## Local development

```bash
npm install
npm run dev
```

Needs a `.env.local` with Supabase, Discord, Finnhub, and Gemini credentials (see
`src/lib/config.js` for what's read where). Not committed, ask for a copy if you're setting this
up fresh.

## Deploying

Hosted on Vercel, connected to this repo — pushes to `main` deploy automatically. Environment
variables are set in the Vercel project settings, not committed anywhere.
