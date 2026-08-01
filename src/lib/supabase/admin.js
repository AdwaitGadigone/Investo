import "server-only";
import WebSocket from "ws";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// The real database access client, bypasses RLS entirely using the secret key. Every
// actual data query (watchlist, portfolio, alerts...) goes through this, always manually
// filtered by the verified Discord user ID from the current session, never trust input.
// "server-only" makes it a build error to ever import this from a "use client" file.
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    // supabase-js always spins up a realtime client, even though we only ever use plain
    // queries here, and that constructor needs a WebSocket implementation. Node 21 (what
    // this machine runs) doesn't have the native global yet (that landed in Node 22), so
    // it has to be handed one explicitly or client creation crashes immediately.
    realtime: { transport: WebSocket },
  }
);
