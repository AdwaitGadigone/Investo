"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const GUILD_COOKIE = "investo_guild";

// 30 days, same rough lifetime as the Supabase session itself, re-picked on the next login either way.
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 };

// Shared by the first-login server picker and the nav's server switcher, both just set which server is active.
export async function selectGuildAction(formData) {
  const guildId = formData.get("guildId")?.toString();
  if (!guildId) return;

  const cookieStore = await cookies();
  cookieStore.set(GUILD_COOKIE, guildId, COOKIE_OPTIONS);
  redirect("/dashboard");
}
