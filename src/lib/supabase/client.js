import { createBrowserClient } from "@supabase/ssr";

// Used only inside "use client" components, e.g. the sign-in button that kicks off the
// Discord OAuth redirect. The publishable key is safe here, RLS locks down every table.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
