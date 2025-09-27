import type { Config } from "tailwindcss";

import typography from "@tailwindcss/typography";

import {
  breakpoints,
  colorTokens,
  containerWidths,
  easingTokens,
  fontFamilyTokens,
  fontWeightTokens,
  lineHeightScale,
  radiiTokens,
  shadowTokens,
  spacingTokens,
  surfaceTokens,
  transitionDurations,
  typeScale,
  zIndexTokens,
} from "./lib/design/tokens";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    screens: breakpoints,
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": containerWidths.wide,
      },
    },
    extend: {
      colors: {
        ...colorTokens,
        surface: surfaceTokens,
      },
      spacing: {
        ...spacingTokens,
      },
      borderRadius: {
        ...radiiTokens,
        DEFAULT: radiiTokens.md,
      },
      fontFamily: {
        display: fontFamilyTokens.display,
        body: fontFamilyTokens.body,
        mono: fontFamilyTokens.mono,
      },
      fontWeight: {
        ...fontWeightTokens,
      },
      lineHeight: {
        ...lineHeightScale,
      },
      fontSize: {
        ...typeScale,
      },
      boxShadow: {
        ...shadowTokens,
      },
      zIndex: {
        ...zIndexTokens,
      },
      transitionDuration: {
        subtle: transitionDurations.subtle,
        base: transitionDurations.base,
        slow: transitionDurations.slow,
        deliberate: transitionDurations.deliberate,
      },
      transitionTimingFunction: {
        standard: easingTokens.standard,
        entrance: easingTokens.entrance,
        exit: easingTokens.exit,
        emphasized: easingTokens.emphasized,
      },
      maxWidth: {
        prose: containerWidths.prose,
        tight: containerWidths.tight,
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            color: "var(--color-ink)",
            fontFamily: fontFamilyTokens.body,
            maxWidth: containerWidths.prose,
            strong: {
              color: "var(--color-ink)",
            },
            a: {
              color: theme("colors.moss.500"),
              fontWeight: "600",
              textDecoration: "none",
              borderBottom: `1px solid ${theme("colors.moss.200")}`,
              transition: `color ${transitionDurations.base} ${easingTokens.standard}, border-color ${transitionDurations.base} ${easingTokens.standard}`,
            },
            "a:hover": {
              color: theme("colors.moss.600"),
              borderColor: theme("colors.moss.400"),
            },
            h1: {
              fontFamily: fontFamilyTokens.display,
              fontWeight: "600",
              color: "var(--color-ink)",
              lineHeight: "1.12",
              marginBottom: theme("spacing.md"),
            },
            h2: {
              fontFamily: fontFamilyTokens.display,
              fontWeight: "600",
              color: "var(--color-ink)",
              lineHeight: "1.18",
              marginTop: `calc(${theme("spacing.xl")} * 1.1)`,
              marginBottom: theme("spacing.sm"),
            },
            h3: {
              fontFamily: fontFamilyTokens.display,
              fontWeight: "600",
              color: "var(--color-ink)",
              lineHeight: "1.24",
              marginTop: theme("spacing.lg"),
              marginBottom: theme("spacing.2xs"),
            },
            blockquote: {
              fontStyle: "normal",
              fontFamily: fontFamilyTokens.display,
              color: theme("colors.moss.600"),
              borderLeftColor: theme("colors.moss.300"),
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            "ol li::marker": {
              color: theme("colors.moss.500"),
            },
            "ul li::marker": {
              color: theme("colors.moss.500"),
            },
            hr: {
              borderColor: theme("colors.slate.300"),
            },
            code: {
              color: theme("colors.moss.600"),
              backgroundColor: theme("colors.sand.100"),
              padding: "0.125em 0.35em",
              borderRadius: radiiTokens.sm,
            },
            pre: {
              backgroundColor: theme("colors.sand.100"),
              borderRadius: radiiTokens.lg,
              padding: theme("spacing.sm"),
              color: "var(--color-ink)",
            },
            "figure figcaption": {
              color: theme("colors.ink.muted"),
              fontSize: theme("fontSize.sm"),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
