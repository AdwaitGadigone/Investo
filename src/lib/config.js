// Single-server only for now, every query is scoped to this one guild ID.
export const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Public by design, it's just a normal Discord "add to server" OAuth link.
export const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1532679103621238854&permissions=8&integration_type=0&scope=bot+applications.commands";
