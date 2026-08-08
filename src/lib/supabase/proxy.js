import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Just an "are they logged in" gate, the real guild membership check runs once at OAuth callback.
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const publicPaths = [
    "/",
    "/login",
    "/auth",
    "/no-servers",
    "/about",
    "/bot",
    "/privacy",
    "/terms",
    // Crawlers and link-preview bots are never logged in, these can't be gated behind auth.
    "/opengraph-image",
    "/robots.txt",
    "/sitemap.xml",
  ];
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
  );

  if (!isLoggedIn && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
