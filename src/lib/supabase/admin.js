import "server-only";
import WebSocket from "ws";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Bypasses RLS via the secret key, always manually filter by the verified Discord user ID.
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    // Node 21 has no native WebSocket global yet, supabase-js's realtime client needs one anyway.
    realtime: { transport: WebSocket },
  }
);
