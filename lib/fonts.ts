const displayFallbackFontFamily = '"Fraunces", "Times New Roman", serif';
const bodyFallbackFontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const displayFontLocal = {
  className: "",
  variable: "",
  style: {
    fontFamily: displayFallbackFontFamily,
  },
} as const;

export const bodyFontLocal = {
  className: "",
  variable: "",
  style: {
    fontFamily: bodyFallbackFontFamily,
  },
} as const;

export const fallbackFontFamilies = {
  display: displayFallbackFontFamily,
  body: bodyFallbackFontFamily,
} as const;
