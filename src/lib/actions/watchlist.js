"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { addToWatchlist, removeFromWatchlist } from "@/lib/data/db";
import { GUILD_ID } from "@/lib/config";

// Server Actions let the watchlist forms mutate the database with no separate API route.

export async function addWatchlistTicker(formData) {
  const { discordId } = await getDiscordUser();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  if (!ticker) return;

  await addToWatchlist(GUILD_ID, discordId, ticker);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  revalidatePath(`/ticker/${encodeURIComponent(ticker)}`);
}

export async function removeWatchlistTicker(formData) {
  const { discordId } = await getDiscordUser();
  const ticker = formData.get("ticker")?.toString();
  if (!ticker) return;

  await removeFromWatchlist(GUILD_ID, discordId, ticker);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  revalidatePath(`/ticker/${encodeURIComponent(ticker)}`);
}
