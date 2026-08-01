import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Pulls the real Discord snowflake ID out of the session, this is the ID every table in
// the bot's database is keyed on. Uses getUser() (not getClaims()) because this confirms
// the session against Supabase itself rather than just trusting an unverified JWT, worth
// the extra round trip anywhere the result decides what data someone can see.
export async function getDiscordUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const identity = user.identities?.find((i) => i.provider === "discord");
  const discordId = identity?.identity_data?.provider_id;

  if (!discordId) redirect("/login");

  return {
    discordId,
    username: identity?.identity_data?.full_name ?? identity?.identity_data?.name ?? "there",
    avatarUrl: identity?.identity_data?.avatar_url,
  };
}

// Same lookup, but for pages that stay public either way (the landing page), so it never
// redirects, just returns null if nobody's signed in instead of bouncing to /login.
export async function getOptionalDiscordUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const identity = user.identities?.find((i) => i.provider === "discord");
  const discordId = identity?.identity_data?.provider_id;
  if (!discordId) return null;

  return {
    discordId,
    username: identity?.identity_data?.full_name ?? identity?.identity_data?.name ?? "there",
  };
}
