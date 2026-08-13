import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserGuilds } from "@/lib/discord/user-guilds";
import { getBotGuilds } from "@/lib/data/db";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

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

  // Code-exchange calls out to Supabase and Discord, a much heavier operation per request than a normal
  // page load, a tighter limit than the general public-page one makes sense here specifically.
  // Namespaced with "auth:" so this stricter budget is its own bucket, not shared with the looser
  // page-view limiter below, unrelated dashboard/ticker traffic from the same IP shouldn't burn this one down.
  if (isRateLimited(`auth:${getClientIp(request)}`, 20, 60 * 1000)) {
    return NextResponse.redirect(`${origin}/login?error=rate_limited`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user && data.session) {
      // Only ever available right here, Supabase doesn't persist or refresh the raw provider token afterward.
      const providerToken = data.session.provider_token;
      const userGuilds = providerToken ? await fetchUserGuilds(providerToken) : null;

      // null means the Discord API call itself failed (rate limit, outage, bad token), not "zero servers".
      // Sending that case to /no-servers would wrongly tell a member of a mutual server they have none.
      if (userGuilds === null) {
        return NextResponse.redirect(`${origin}/login?error=guilds`);
      }

      const botGuilds = await getBotGuilds();
      const botGuildIds = new Set(botGuilds.map((g) => g.guild_id));

      const mutualGuilds = userGuilds
        .filter((g) => botGuildIds.has(g.id))
        .map((g) => ({ id: g.id, name: g.name, icon: guildIconUrl(g.id, g.icon) }));

      if (mutualGuilds.length === 0) {
        // Clears any stale cookies from a previous login where the user had more servers than they do now,
        // otherwise a leftover investo_guild/investo_guilds cookie would let /dashboard "work" anyway.
        const response = NextResponse.redirect(`${origin}/no-servers`);
        response.cookies.delete(GUILD_COOKIE);
        response.cookies.delete(GUILDS_COOKIE);
        return response;
      }

      if (mutualGuilds.length === 1) {
        const response = NextResponse.redirect(`${origin}/dashboard`);
        response.cookies.set(GUILD_COOKIE, mutualGuilds[0].id, COOKIE_OPTIONS);
        // Same staleness guard: a user who used to be in multiple mutual servers and is now down to one
        // shouldn't still have an old multi-server list backing the switcher and selectGuildAction's check.
        response.cookies.delete(GUILDS_COOKIE);
        return response;
      }

      const response = NextResponse.redirect(`${origin}/select-server`);
      response.cookies.set(GUILDS_COOKIE, JSON.stringify(mutualGuilds), COOKIE_OPTIONS);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
