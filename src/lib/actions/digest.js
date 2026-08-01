"use server";

import { revalidatePath } from "next/cache";
import { getDiscordUser } from "@/lib/auth/get-discord-user";
import { isDigestEnabled, enableDigest, disableDigest } from "@/lib/data/db";
import { GUILD_ID } from "@/lib/config";

export async function toggleDigestAction() {
  const { discordId } = await getDiscordUser();

  const on = await isDigestEnabled(GUILD_ID, discordId);
  if (on) {
    await disableDigest(GUILD_ID, discordId);
  } else {
    await enableDigest(GUILD_ID, discordId);
  }

  revalidatePath("/news");
  revalidatePath("/dashboard");
}
