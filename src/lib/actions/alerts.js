"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { addAlert, removeAlert } from "@/lib/data/db";
import { getQuote } from "@/lib/market/yahoo";

export async function addAlertAction(formData) {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();
  const ticker = formData.get("ticker")?.toString().toUpperCase().trim();
  const direction = formData.get("direction")?.toString();
  const targetPrice = parseFloat(formData.get("target_price"));

  if (!ticker || (direction !== "above" && direction !== "below") || !Number.isFinite(targetPrice) || targetPrice <= 0) {
    return;
  }

  // Same check the bot's /alert set does before saving, a typo'd ticker shouldn't sit there silently never firing.
  const quote = await getQuote(ticker);
  if (!quote) return;

  await addAlert(guildId, discordId, ticker, direction, targetPrice);
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
}

export async function removeAlertAction(formData) {
  const { discordId } = await getDiscordUser();
  const alertId = parseInt(formData.get("alert_id"), 10);
  if (!Number.isFinite(alertId)) return;

  await removeAlert(discordId, alertId);
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
}
