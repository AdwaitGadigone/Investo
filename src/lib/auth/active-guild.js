import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const GUILD_COOKIE = "investo_guild";

// Replaces the old static GUILD_ID import, every page now reads whichever server the user actually picked.
export async function getActiveGuildId() {
  const cookieStore = await cookies();
  const guildId = cookieStore.get(GUILD_COOKIE)?.value;
  if (!guildId) redirect("/select-server");
  return guildId;
}

// Same cookie as getActiveGuildId, but never redirects, for spots that just want to know without forcing a picker.
export async function peekActiveGuildId() {
  const cookieStore = await cookies();
  return cookieStore.get(GUILD_COOKIE)?.value ?? null;
}

// For the nav's server switcher, empty when there's only ever been one mutual server to pick from.
export async function getAvailableGuilds() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("investo_guilds")?.value;
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
