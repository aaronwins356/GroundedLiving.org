import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

const displayFontFamily = '"Fraunces", "Times New Roman", serif';
const bodyFontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 140) || "Grounded Living";
  const subtitle = searchParams.get("subtitle")?.slice(0, 160) ?? null;
  const type = searchParams.get("type") === "post" ? "Journal" : "Page";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: WIDTH,
          height: HEIGHT,
          padding: 80,
          backgroundColor: "#F8F5F2",
          color: "#0F172A",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: displayFontFamily, fontSize: 40, fontWeight: 700 }}>
            Grounded Living
          </div>
          <div
            style={{
              fontFamily: bodyFontFamily,
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: 6,
              color: "#5B7F6B",
            }}
          >
            {type}
          </div>
        </div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: 90,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: 900,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontFamily: bodyFontFamily,
                  fontSize: 32,
                  maxWidth: 720,
                  lineHeight: 1.4,
                  color: "#334155",
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ width: 120, height: 8, backgroundColor: "#5B7F6B" }} />
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
}
