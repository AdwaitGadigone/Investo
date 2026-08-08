"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { addToWatchlist, removeFromWatchlist } from "@/lib/data/db";

// Server Actions let the watchlist forms mutate the database with no separate API route.
export async function addWatchlistTicker(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  if (!ticker) return;

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
