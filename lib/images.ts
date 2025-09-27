const CONTENTFUL_BASE_URL = "https://images.ctfassets.net";

export type ContentfulFit = "fill" | "pad" | "scale" | "crop" | "thumb" | "face";

export interface ContentfulImageParams {
  width?: number;
  height?: number;
  quality?: number;
  fit?: ContentfulFit;
  focus?: string;
  background?: string;
  format?: "avif" | "webp" | "jpg" | "png" | "auto";
}

/**
 * Normalize Contentful asset URLs with predictable dimensions and compression so
 * the Next.js image optimizer downloads smaller payloads by default. The
 * defaults lean toward modern formats (WebP) with a perceptual quality target
 * that still keeps bytes low.
 */
export function buildContentfulImageUrl(url: string, params: ContentfulImageParams = {}): string {
  if (!url) {
    return url;
  }

  const resolvedUrl = url.startsWith("http") ? new URL(url) : new URL(url, CONTENTFUL_BASE_URL);

  const { width, height, quality = 70, fit, focus, background, format = "webp" } = params;

  if (width) {
    resolvedUrl.searchParams.set("w", String(width));
  }

  if (height) {
    resolvedUrl.searchParams.set("h", String(height));
  }

  if (fit) {
    resolvedUrl.searchParams.set("fit", fit);
  }

  if (focus) {
    resolvedUrl.searchParams.set("f", focus);
  }

  if (background) {
    resolvedUrl.searchParams.set("bg", background);
  }

  if (quality) {
    resolvedUrl.searchParams.set("q", String(Math.min(Math.max(quality, 1), 100)));
  }

  if (format) {
    resolvedUrl.searchParams.set("fm", format);
  }

  resolvedUrl.searchParams.set("auto", "compress");

  return resolvedUrl.toString();
}
