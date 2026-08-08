export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything past login is per-account data, nothing there is useful to have indexed.
      disallow: ["/dashboard", "/watchlist", "/portfolio", "/news", "/ticker", "/select-server", "/no-servers"],
    },
    sitemap: "https://investoweb.vercel.app/sitemap.xml",
  };
}
