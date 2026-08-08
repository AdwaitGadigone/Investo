import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserGuilds } from "@/lib/discord/user-guilds";
import { getBotGuilds } from "@/lib/data/db";

const GUILD_COOKIE = "investo_guild";
const GUILDS_COOKIE = "investo_guilds";

// 30 days, same rough lifetime as the Supabase session itself, re-picked on the next login either way.
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 };

function guildIconUrl(guildId, iconHash) {
  return iconHash ? `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png` : null;
}

// Supabase lands here after Discord consent, this is where "which of my servers has the bot" gets resolved.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user && data.session) {
      // Only ever available right here, Supabase doesn't persist or refresh the raw provider token afterward.
      const providerToken = data.session.provider_token;
      const userGuilds = providerToken ? await fetchUserGuilds(providerToken) : [];
      const botGuilds = await getBotGuilds();
      const botGuildIds = new Set(botGuilds.map((g) => g.guild_id));

      const mutualGuilds = userGuilds
        .filter((g) => botGuildIds.has(g.id))
        .map((g) => ({ id: g.id, name: g.name, icon: guildIconUrl(g.id, g.icon) }));

      if (mutualGuilds.length === 0) {
        return NextResponse.redirect(`${origin}/no-servers`);
      }

      if (mutualGuilds.length === 1) {
        const response = NextResponse.redirect(`${origin}/dashboard`);
        response.cookies.set(GUILD_COOKIE, mutualGuilds[0].id, COOKIE_OPTIONS);
        return response;
      }

      const response = NextResponse.redirect(`${origin}/select-server`);
      response.cookies.set(GUILDS_COOKIE, JSON.stringify(mutualGuilds), COOKIE_OPTIONS);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
