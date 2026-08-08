"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { getActiveGuildId } from "@/lib/auth/active-guild";
import { isDigestEnabled, enableDigest, disableDigest } from "@/lib/data/db";

export async function toggleDigestAction() {
  const { discordId } = await getDiscordUser();
  const guildId = await getActiveGuildId();

  const on = await isDigestEnabled(guildId, discordId);
  if (on) {
    await disableDigest(guildId, discordId);
  } else {
    await enableDigest(guildId, discordId);
  }

  revalidatePath("/news");
  revalidatePath("/dashboard");
}
