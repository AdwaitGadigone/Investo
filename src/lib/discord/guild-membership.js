import "server-only";

const GUILD_ID = process.env.DISCORD_GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Signing in with Discord alone would let ANYONE with a Discord account in, this checks
// they're actually a member of the one server Investo is for. The bot's own token can
// look up a single member without needing the privileged "server members" intent.
export async function isGuildMember(discordUserId) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      cache: "no-store",
    }
  );

  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Discord API error checking guild membership: ${res.status}`);
  return true;
}
