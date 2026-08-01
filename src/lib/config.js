// The site only serves one Discord server for now, so every data query is scoped to this
// one guild ID instead of building out multi-server selection nobody needs yet.
export const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Same invite link used to add the bot in the first place, safe to be public (it's just
// a normal Discord OAuth "add to server" link, not a secret).
export const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1532679103621238854&permissions=8&integration_type=0&scope=bot+applications.commands";
