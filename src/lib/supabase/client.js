import { createBrowserClient } from "@supabase/ssr";

// Client components only, e.g. the sign-in button. Publishable key is safe, RLS locks tables.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
