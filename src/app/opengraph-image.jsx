import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at request time, no separate image asset to keep in sync with the brand colors.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#18191c",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 22% 25%, rgba(88,101,242,0.22), transparent 40%), radial-gradient(circle at 80% 75%, rgba(12,163,12,0.18), transparent 45%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 16 L9 11" stroke="#d03b3b" />
            <path d="M9 11 L14 15 L21 5" stroke="#0ca30c" />
            <path d="M15 5 L21 5 L21 11" stroke="#0ca30c" />
          </svg>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 800, color: "#f2f2f0", letterSpacing: -2 }}>
            INVEST
            <span style={{ color: "#0ca30c" }}>O</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#9c9da3" }}>
          Stocks, crypto, and more, in Discord and on the web
        </div>
      </div>
    ),
    { ...size }
  );
}
