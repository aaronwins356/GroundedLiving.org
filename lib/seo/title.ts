import seoConfig from "@/next-seo.config";

import { collapseWhitespace, truncateAtBoundary } from "./text";

interface BuildMetaTitleOptions {
  brand?: string;
  separator?: string;
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 60;
const DEFAULT_SEPARATOR = " | ";

export function buildMetaTitle(baseTitle: string, options: BuildMetaTitleOptions = {}): string {
  const defaultBrand = seoConfig.openGraph?.site_name ?? "Grounded Living";
  const brand = collapseWhitespace(options.brand ?? defaultBrand);
  const separator = options.separator ?? DEFAULT_SEPARATOR;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
  const normalizedTitle = collapseWhitespace(baseTitle);

  const effectiveTitle = normalizedTitle || brand || seoConfig.defaultTitle;
  const suffixLength = separator.length + brand.length;
  const maxBaseLength = Math.max(0, maxLength - suffixLength);

  if (!brand || suffixLength === 0 || maxBaseLength === 0) {
    return truncateAtBoundary(effectiveTitle, maxLength);
  }

  const safeBase = truncateAtBoundary(effectiveTitle, maxBaseLength);
  return `${safeBase}${separator}${brand}`;
}
