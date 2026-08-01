import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isGuildMember } from "@/lib/discord/guild-membership";

// Supabase lands here after Discord consent, this is the one place membership gets checked.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const discordId = data.user.identities?.find((i) => i.provider === "discord")
        ?.identity_data?.provider_id;

      const member = discordId ? await isGuildMember(discordId) : false;

      if (!member) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/unauthorized`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
