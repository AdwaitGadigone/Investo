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
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .select("ticker, shares, cost_basis")
    .eq("guild_id", guildId)
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

// Mirrors the bot's weighted-average cost basis logic, buys blend into one average, not separate lots.
export async function buyPosition(guildId, userId, ticker, shares, price) {
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from("portfolio")
    .select("shares, cost_basis")
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  if (existing) {
    const totalShares = existing.shares + shares;
    const totalCost = existing.shares * existing.cost_basis + shares * price;
    const { error } = await supabaseAdmin
      .from("portfolio")
      .update({ shares: totalShares, cost_basis: totalCost / totalShares })
      .eq("guild_id", guildId)
      .eq("user_id", userId)
      .eq("ticker", ticker);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from("portfolio")
      .insert({ guild_id: guildId, user_id: userId, ticker, shares, cost_basis: price });
    if (error) throw error;
  }
}

// Overwrites directly instead of blending like buyPosition, this is for fixing a typo'd entry.
export async function editPosition(guildId, userId, ticker, shares, costBasis) {
  const { error } = await supabaseAdmin
    .from("portfolio")
    .update({ shares, cost_basis: costBasis })
    .eq("guild_id", guildId)
    .eq("user_id", userId)
    .eq("ticker", ticker);
  if (error) throw error;
}

export async function removePosition(guildId, userId, ticker) {
  const { error, count } = await supabaseAdmin
    .from("portfolio")
    .delete({ count: "exact" })
    .eq("guild_id", guildId)
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
  if (error) throw error;
  return data;
}
