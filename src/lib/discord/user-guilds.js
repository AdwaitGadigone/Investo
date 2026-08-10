import "server-only";

// Discord snowflakes exceed JS's safe integer range, everything here stays a string end to end.
// Returns null on any failure (network error, non-2xx, bad JSON), distinct from a real empty array,
// so the caller can tell "couldn't check" apart from "genuinely in zero mutual servers".
export async function fetchUserGuilds(accessToken) {
  try {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
