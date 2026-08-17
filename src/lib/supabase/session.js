import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

// Just the pages that actually fan out to Yahoo/Finnhub on every load, not the static marketing pages,
// those don't need protecting and a real visitor browsing them shouldn't ever bump into this.
const RATE_LIMITED_PATHS = ["/dashboard", "/ticker", "/commodities"];

// Just an "are they logged in" gate, the real guild membership check runs once at OAuth callback.
export async function updateSession(request) {
  const pathname = request.nextUrl.pathname;

  // Checked before auth, applies equally whether logged in or not, these pages fan out to real API calls
  // on every load and used to be gated behind an account, that gate is gone now that they're public.
  if (RATE_LIMITED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    // Namespaced with "page:" so this bucket isn't shared with the search API's separate limiter below,
    // hammering one shouldn't burn down the other's budget for the same visitor.
    if (isRateLimited(`page:${getClientIp(request)}`, 60, 60 * 1000)) {
      return new NextResponse("Too many requests, slow down.", { status: 429 });
    }
  }

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
    "/status",
    // Market data needs no guild or personal account at all, browsable by anyone. The pages themselves
    // still branch on getOptionalDiscordUser()/peekActiveGuildId() to show real personal data when logged in,
    // or a sign-in prompt in place of it when not, this just stops the middleware forcing a login wall first.
    "/dashboard",
    "/ticker",
    "/commodities",
    "/api/search",
    // Crawlers and link-preview bots are never logged in, these can't be gated behind auth.
    "/opengraph-image",
    "/robots.txt",
    "/sitemap.xml",
  ];
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!isLoggedIn && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
