import "server-only";

// Discord snowflakes exceed JS's safe integer range, everything here stays a string end to end.
export async function fetchUserGuilds(accessToken) {
  const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}
