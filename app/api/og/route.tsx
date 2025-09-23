import { ImageResponse } from "next/og";

export const runtime = "edge";

const fontUrl = new URL("../../../public/fonts/PlayfairDisplay-SemiBold.ttf", import.meta.url);

async function loadFont() {
  try {
    const res = await fetch(fontUrl);
    return res.arrayBuffer();
  } catch (error) {
    console.warn("Failed to load OG font", error);
    return undefined;
  }
}

const fontDataPromise = loadFont();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Grounded Living";
  const tag = searchParams.get("tag") ?? "Soulful wellness";

  const fontData = await fontDataPromise;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #fdfaf5 0%, #f1d5d5 100%)",
          padding: "80px",
          fontFamily: fontData ? "Playfair" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <span style={{ fontSize: "28px", textTransform: "uppercase", letterSpacing: "0.35em", color: "#6c9f88" }}>
            Grounded Living
          </span>
          <span style={{ fontSize: "68px", lineHeight: 1.1, color: "#3b443b", maxWidth: "900px" }}>{title}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#3b443b" }}>
          <span style={{ fontSize: "28px", letterSpacing: "0.2em", textTransform: "uppercase" }}>{tag}</span>
          <span style={{ fontSize: "24px", letterSpacing: "0.2em", textTransform: "uppercase" }}>groundedliving.org</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [
            {
              name: "Playfair",
              data: fontData,
              style: "normal",
            },
          ]
        : undefined,
    },
  );
}
