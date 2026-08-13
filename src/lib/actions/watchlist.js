"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { addToWatchlist, removeFromWatchlist } from "@/lib/data/db";
import { getQuote } from "@/lib/market/yahoo";

// Server Actions let the watchlist forms mutate the database with no separate API route.
export async function addWatchlistTicker(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  if (!ticker) return;

  // Same check the bot's /watchlist add does, a typo'd ticker shouldn't sit on the list forever showing N/A.
  const quote = await getQuote(ticker);
  if (!quote) return;

  await addToWatchlist(guildId, discordId, ticker);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  revalidatePath(`/ticker/${encodeURIComponent(ticker)}`);
}

export async function removeWatchlistTicker(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString();
  if (!ticker) return;

  await removeFromWatchlist(guildId, discordId, ticker);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  revalidatePath(`/ticker/${encodeURIComponent(ticker)}`);
}
