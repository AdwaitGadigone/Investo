"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { buyPosition, editPosition, removePosition } from "@/lib/db";
import { getQuote } from "@/lib/market/yahoo";

export async function buyPositionAction(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  const shares = parseFloat(formData.get("shares"));
  const price = parseFloat(formData.get("price"));

  if (!ticker || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(price) || price <= 0) {
    return;
  }

  // Same check the bot's /portfolio buy does, only on the creation path, editPosition below just corrects
  // numbers on a position that already passed this check once.
  const quote = await getQuote(ticker);
  if (!quote) return;

  // false means it's a short opened via the bot, buying here would wrongly blend into the wrong side.
  const ok = await buyPosition(guildId, discordId, ticker, shares, price);
  if (!ok) return;
  revalidatePath("/dashboard");
}

export async function editPositionAction(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  const shares = parseFloat(formData.get("shares"));
  const costBasis = parseFloat(formData.get("cost_basis"));

  if (!ticker || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(costBasis) || costBasis <= 0) {
    return;
  }

  await editPosition(guildId, discordId, ticker, shares, costBasis);
  revalidatePath("/dashboard");
}

export async function removePositionAction(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString();
  if (!ticker) return;

  await removePosition(guildId, discordId, ticker);
  revalidatePath("/dashboard");
}
