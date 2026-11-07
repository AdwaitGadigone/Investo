import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Mirrors Investobot's src/services/db.py 1:1, same tables, bot and site share one database.
export async function getWatchlist(guildId, userId) {
  const { data, error } = await supabaseAdmin
    .from("watchlist")
    .select("ticker")
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .order("ticker");
  if (error) throw error;
  return data.map((row) => row.ticker);
}

export async function addToWatchlist(guildId, userId, ticker) {
  const { error } = await supabaseAdmin
    .from("watchlist")
    .insert({ guild_id: guildId, user_id: userId, ticker });
  if (error) {
    // Postgres' unique_violation code, means the ticker's already on the watchlist.
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}

export async function removeFromWatchlist(guildId, userId, ticker) {
  const { error, count } = await supabaseAdmin
    .from("watchlist")
    .delete({ count: "exact" })
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .eq("ticker", ticker);
  if (error) throw error;
  return count > 0;
}

export async function getPortfolio(guildId, userId) {
  // guildId kept in signature for backward compat; portfolios are now global per-user.
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .select("ticker, direction, shares, cost_basis")
    .eq("user_id", userId)
    .order("ticker");
  if (error) throw error;
  return data;
}

export async function getActiveAlerts(guildId, userId) {
  const { data, error } = await supabaseAdmin
    .from("alerts")
    .select("id, ticker, direction, target_price")
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .eq("active", 1)
    .order("id");
  if (error) throw error;
  return data;
}

// Mirrors the bot's add_alert exactly, same table, checked by /alert set in Discord.
export async function addAlert(guildId, userId, ticker, direction, targetPrice) {
  const { error } = await supabaseAdmin
    .from("alerts")
    .insert({ guild_id: guildId, user_id: userId, ticker, direction, target_price: targetPrice });
  if (error) throw error;
}

// Hard delete, not a soft active=0 flip, matches the bot's remove_alert. Scoped by user_id only (not guild_id
// too), same as the bot: alert ids are a global sequence, one id can only ever belong to one user's one alert.
export async function removeAlert(userId, alertId) {
  const { error, count } = await supabaseAdmin
    .from("alerts")
    .delete({ count: "exact" })
    .eq("id", alertId)
    .eq("user_id", userId);
  if (error) throw error;
  return count > 0;
}

// Mirrors the bot's weighted-average cost basis logic, buys blend into one average, not separate lots.
// The website has no shorting UI, this is always a "long" buy, but a short opened via the bot still
// lives in the same table, so this has to refuse to blend into it instead of silently corrupting it.
export async function buyPosition(guildId, userId, ticker, shares, price) {
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from("portfolio")
    .select("direction, shares, cost_basis")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  if (existing && existing.direction === "short") {
    return false;
  }

  if (existing) {
    const totalShares = existing.shares + shares;
    const totalCost = existing.shares * existing.cost_basis + shares * price;
    const { error } = await supabaseAdmin
      .from("portfolio")
      .update({ shares: totalShares, cost_basis: totalCost / totalShares })
      .eq("user_id", userId)
      .eq("ticker", ticker);
    if (error) throw error;
  } else {
    // guild_id stored as 0; portfolios are now global per-user, column kept for schema compat.
    const { error } = await supabaseAdmin
      .from("portfolio")
      .insert({ guild_id: 0, user_id: userId, ticker, shares, cost_basis: price, direction: "long" });
    if (error) throw error;
  }
  return true;
}

// Overwrites directly instead of blending like buyPosition, this is for fixing a typo'd entry.
export async function editPosition(guildId, userId, ticker, shares, costBasis) {
  const { error } = await supabaseAdmin
    .from("portfolio")
    .update({ shares, cost_basis: costBasis })
    .eq("user_id", userId)
    .eq("ticker", ticker);
  if (error) throw error;
}

export async function removePosition(guildId, userId, ticker) {
  const { error, count } = await supabaseAdmin
    .from("portfolio")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("ticker", ticker);
  if (error) throw error;
  return count > 0;
}

export async function isDigestEnabled(guildId, userId) {
  const { data, error } = await supabaseAdmin
    .from("digest_optin")
    .select("user_id")
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function enableDigest(guildId, userId) {
  const { error } = await supabaseAdmin
    .from("digest_optin")
    .insert({ guild_id: guildId, user_id: userId });
  if (error) {
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}

export async function disableDigest(guildId, userId) {
  const { error, count } = await supabaseAdmin
    .from("digest_optin")
    .delete({ count: "exact" })
    .eq("guild_id", guildId)
    .eq("user_id", userId);
  if (error) throw error;
  return count > 0;
}

// The ::text cast keeps guild_id a string end to end, letting it through as a number risks silent precision loss.
export async function getBotGuilds() {
  const { data, error } = await supabaseAdmin.from("bot_guilds").select("guild_id::text, name, icon_hash");
  if (error) {
    // Table won't exist until the bot's next redeploy runs its schema migration, fail open to "no servers" instead of crashing login.
    console.error("getBotGuilds failed, treating as empty:", error.message);
    return [];
  }
  return data;
}

// The bot writes this every 2 minutes, a stale timestamp here means the bot process itself is down or hung.
export async function getBotHeartbeat() {
  const { data, error } = await supabaseAdmin
    .from("bot_status")
    .select("last_heartbeat")
    .eq("singleton_id", 1)
    .maybeSingle();
  if (error) {
    // Table won't exist until the bot's next redeploy, that's "no heartbeat yet", not a real database failure.
    console.error("getBotHeartbeat failed:", error.message);
    return null;
  }
  return data?.last_heartbeat ?? null;
}

// Checks a table that's always existed, independent of whichever migration the bot's last deploy happened to add.
export async function pingDatabase() {
  const { error } = await supabaseAdmin.from("watchlist").select("ticker").limit(1);
  return !error;
}
