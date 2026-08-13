/** @type {import('next').NextConfig} */

// 'unsafe-inline' on script/style is a real tradeoff, not an oversight: this Next.js version's own
// hydration payload and every style={{...}} prop in this codebase (there are many) rely on it, and a
// nonce-based CSP needs threading a per-request nonce through middleware into every <Script> tag, a much
// bigger change with real risk of silently breaking RSC/hydration on a Next.js version already documented
// (see AGENTS.md) as diverging from standard behavior. Still meaningfully tighter than no CSP: no eval,
// no remote script origins beyond the ones this app actually uses, no third-party data exfiltration via img.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://s3.tradingview.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.discordapp.com https://images.financialmodelingprep.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com",
  "frame-src 'self' https://*.tradingview.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  // Vercel already terminates TLS and redirects http->https, this is a second, explicit guarantee.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Redundant with frame-ancestors above for modern browsers, kept for the ones that only read this header.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site uses camera/mic/location/payment, deny them all rather than leave the default open.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
