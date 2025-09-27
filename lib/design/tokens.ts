export const colorTokens = {
  ink: {
    DEFAULT: "#13221E",
    soft: "rgba(19, 34, 30, 0.78)",
    muted: "rgba(19, 34, 30, 0.6)",
  },
  sand: {
    25: "#FDFBF9",
    50: "#FAF7F2",
    100: "#F1ECE3",
    200: "#E9E1D7",
  },
  moss: {
    100: "#E4EFE7",
    200: "#C9DDCF",
    300: "#A2C2AD",
    400: "#7B9E89",
    500: "#5B7F6B",
    600: "#4A6858",
    700: "#3D5749",
  },
  fern: {
    100: "#E3F0E8",
    200: "#CCE2D5",
    300: "#B5D3C2",
  },
  clay: {
    100: "#F2E4D8",
    200: "#E3CCB6",
    300: "#D6BBA7",
    400: "#C8A98E",
  },
  saffron: {
    100: "#F6E6C7",
    300: "#E6C16A",
    400: "#D9A441",
    500: "#C58A2F",
  },
  slate: {
    100: "#F0F3F2",
    300: "#D3DBD7",
    600: "#50625B",
  },
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type ColorTokenName = keyof typeof colorTokens;

export const surfaceTokens = {
  page: "var(--color-sand-25)",
  panel: "rgba(250, 247, 242, 0.88)",
  card: "rgba(248, 245, 242, 0.9)",
  overlay: "rgba(19, 34, 30, 0.36)",
} as const;

export const spacingTokens = {
  "3xs": "0.25rem",
  "2xs": "0.5rem",
  xs: "0.75rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2.25rem",
  xl: "3rem",
  "2xl": "4rem",
  "3xl": "5.5rem",
  "4xl": "7rem",
} as const;

export const radiiTokens = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  pill: "999px",
} as const;

export const shadowTokens = {
  soft: "0 26px 60px -32px rgba(19, 34, 30, 0.32)",
  floating: "0 36px 76px -28px rgba(19, 34, 30, 0.38)",
  focus: "0 0 0 3px rgba(217, 164, 65, 0.45)",
  outline: "0 0 0 1px rgba(91, 127, 107, 0.28)",
} as const;

export const transitionDurations = {
  subtle: "120ms",
  base: "200ms",
  slow: "320ms",
} as const;

export const easingTokens = {
  standard: "cubic-bezier(0.33, 1, 0.68, 1)",
  entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.7, 0, 0.84, 0)",
} as const;

export const fontFamilyTokens = {
  display: "var(--font-display, 'Fraunces', 'Times New Roman', serif)",
  body: "var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
} as const;

export const typeScale = {
  xs: ["clamp(0.82rem, 0.79rem + 0.08vw, 0.88rem)", { lineHeight: "1.65" }],
  sm: ["clamp(0.9rem, 0.85rem + 0.16vw, 0.98rem)", { lineHeight: "1.68" }],
  base: ["clamp(1rem, 0.96rem + 0.22vw, 1.125rem)", { lineHeight: "1.72" }],
  lg: ["clamp(1.15rem, 1.05rem + 0.32vw, 1.35rem)", { lineHeight: "1.65" }],
  xl: ["clamp(1.45rem, 1.25rem + 0.72vw, 1.95rem)", { lineHeight: "1.35" }],
  "2xl": ["clamp(1.85rem, 1.5rem + 1.25vw, 2.6rem)", { lineHeight: "1.25" }],
  "3xl": ["clamp(2.35rem, 1.9rem + 1.8vw, 3.3rem)", { lineHeight: "1.18" }],
  "4xl": ["clamp(3rem, 2.4rem + 2.3vw, 4.2rem)", { lineHeight: "1.12" }],
} as const;

export const containerWidths = {
  prose: "68ch",
  tight: "56ch",
  wide: "72rem",
} as const;

export type TypeScaleKey = keyof typeof typeScale;
export type SpacingTokenKey = keyof typeof spacingTokens;
export type RadiusTokenKey = keyof typeof radiiTokens;
export type ShadowTokenKey = keyof typeof shadowTokens;
export type TransitionDurationKey = keyof typeof transitionDurations;
