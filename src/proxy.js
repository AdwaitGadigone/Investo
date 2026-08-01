import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed middleware.ts -> proxy.ts (same functionality, new name), this file
// has to live at the same level as app/, so src/proxy.js since this project uses src/.
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
