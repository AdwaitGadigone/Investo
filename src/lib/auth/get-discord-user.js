import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// getUser(), not getClaims(): confirms the session against Supabase, not just an unverified JWT.
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

// Same lookup for public pages, returns null instead of redirecting when logged out.
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
