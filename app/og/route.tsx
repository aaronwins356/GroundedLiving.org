import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

const displayFontFamily = '"Fraunces", "Times New Roman", serif';
const bodyFontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const variants = {
  editorial: {
    background: "linear-gradient(135deg, #f5f1eb 0%, #e3ede6 100%)",
    panel: "rgba(250, 247, 242, 0.9)",
    accent: "#5B7F6B",
    eyebrow: "Journal",
  },
  commerce: {
    background: "linear-gradient(135deg, #101d18 0%, #1d2b26 100%)",
    panel: "rgba(17, 27, 23, 0.78)",
    accent: "#E2C289",
    eyebrow: "Shop",
  },
} as const;

type VariantName = keyof typeof variants;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawVariant = (searchParams.get("variant") ?? "editorial") as VariantName;
  const variant: VariantName = rawVariant in variants ? rawVariant : "editorial";
  const theme = variants[variant];

  const title = searchParams.get("title")?.slice(0, 140) || "Grounded Living";
  const subtitle = searchParams.get("subtitle")?.slice(0, 160) ?? null;
  const eyebrow = searchParams.get("eyebrow")?.slice(0, 32) ?? theme.eyebrow;
  const tag = searchParams.get("tag")?.slice(0, 32) ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundImage: theme.background,
          padding: 72,
          color: variant === "commerce" ? "#F5F1E6" : "#13221E",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 22,
                textTransform: "uppercase",
                letterSpacing: 8,
                color: theme.accent,
              }}
            >
              {eyebrow}
            </div>
            <div style={{ fontFamily: displayFontFamily, fontSize: 38, fontWeight: 700 }}>Grounded Living</div>
          </div>
          {tag ? (
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 20,
                padding: "8px 20px",
                borderRadius: 999,
                border: `2px solid ${theme.accent}`,
                color: theme.accent,
                backgroundColor: variant === "commerce" ? "rgba(226, 194, 137, 0.12)" : "rgba(91, 127, 107, 0.12)",
              }}
            >
              {tag}
            </div>
          ) : null}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              padding: "48px 56px",
              backgroundColor: theme.panel,
              borderRadius: 48,
              backdropFilter: "blur(8px)",
              border: `1px solid ${variant === "commerce" ? "rgba(226, 194, 137, 0.24)" : "rgba(19,34,30,0.1)"}`,
              boxShadow:
                variant === "commerce"
                  ? "0 40px 120px -60px rgba(0, 0, 0, 0.45)"
                  : "0 36px 110px -60px rgba(19, 34, 30, 0.36)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: displayFontFamily,
                fontSize: 84,
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: -2,
                maxWidth: 880,
              }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: bodyFontFamily,
                  fontSize: 32,
                  lineHeight: 1.45,
                  maxWidth: 760,
                  color: variant === "commerce" ? "rgba(245, 241, 230, 0.78)" : "rgba(19, 34, 30, 0.72)",
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: bodyFontFamily,
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          <span>groundedliving.org</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              color: theme.accent,
              fontWeight: 600,
            }}
          >
            <span style={{ display: "inline-block", width: 64, height: 4, backgroundColor: theme.accent, borderRadius: 999 }} />
            Rooted rituals & modern commerce
          </span>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
}
