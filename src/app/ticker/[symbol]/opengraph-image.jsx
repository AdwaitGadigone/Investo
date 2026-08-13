import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { getQuote } from "@/lib/market/yahoo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same background treatment as the site-wide opengraph-image.jsx, this one just adds the actual quote,
// so a shared ticker link shows real price/change instead of the generic site card every page used to get.
export default async function TickerOpengraphImage({ params }) {
  const { symbol } = await params;
  const ticker = symbol.toUpperCase();
  const quote = await getQuote(ticker);

  const logoBuffer = await readFile(path.join(process.cwd(), "public", "investo-logo.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const up = quote?.changePct != null && quote.changePct >= 0;
  const color = up ? "#0ca30c" : "#d03b3b";
  const priceText =
    quote?.price != null
      ? quote.currency && quote.currency !== "USD"
        ? `${quote.currency} ${quote.price.toFixed(2)}`
        : `$${quote.price.toFixed(2)}`
      : null;
  const changeText =
    quote?.change != null
      ? `${up ? "+" : ""}${quote.change.toFixed(2)} (${up ? "+" : ""}${quote.changePct.toFixed(2)}%)`
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#18191c",
          position: "relative",
          padding: 64,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 22% 25%, rgba(88,101,242,0.2), transparent 40%), radial-gradient(circle at 80% 75%, rgba(12,163,12,0.16), transparent 45%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={logoSrc} width={56} height={42} />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#f2f2f0", letterSpacing: -1 }}>
            INVEST<span style={{ color: "#0ca30c" }}>O</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 40, color: "#9c9da3", marginBottom: 8 }}>
            {quote?.name ?? ticker}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <div style={{ display: "flex", fontSize: 140, fontWeight: 800, color: "#f2f2f0", letterSpacing: -3 }}>
              {ticker}
            </div>
            {priceText && (
              <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#f2f2f0" }}>{priceText}</div>
            )}
          </div>
          {changeText && (
            <div style={{ display: "flex", fontSize: 44, fontWeight: 600, color, marginTop: 8 }}>
              {changeText} today
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
