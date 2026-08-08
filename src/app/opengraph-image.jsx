import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at request time, reads the logo straight off disk since satori can't resolve a relative /public path.
export default async function OpengraphImage() {
  const logoBuffer = await readFile(path.join(process.cwd(), "public", "investo-logo.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

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
          <img src={logoSrc} width={140} height={105} />
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
