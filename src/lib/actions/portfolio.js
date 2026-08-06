"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { buyPosition, editPosition, removePosition } from "@/lib/data/db";
import { GUILD_ID } from "@/lib/config";

export async function buyPositionAction(formData) {
  const { discordId } = await getDiscordUser();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  const shares = parseFloat(formData.get("shares"));
  const price = parseFloat(formData.get("price"));

  if (!ticker || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(price) || price <= 0) {
    return;
  }

  await buyPosition(GUILD_ID, discordId, ticker, shares, price);
  revalidatePath("/dashboard");
}

export async function editPositionAction(formData) {
  const { discordId } = await getDiscordUser();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  const shares = parseFloat(formData.get("shares"));
  const costBasis = parseFloat(formData.get("cost_basis"));

  if (!ticker || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(costBasis) || costBasis <= 0) {
    return;
  }

  await editPosition(GUILD_ID, discordId, ticker, shares, costBasis);
  revalidatePath("/dashboard");
}

export async function removePositionAction(formData) {
  const { discordId } = await getDiscordUser();
  const ticker = formData.get("ticker")?.toString();
  if (!ticker) return;

  await removePosition(GUILD_ID, discordId, ticker);
  revalidatePath("/dashboard");
}
