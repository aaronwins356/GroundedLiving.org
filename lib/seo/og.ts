import { siteUrl } from "@/lib/site";

export interface OgImageOptions {
  subtitle?: string;
  eyebrow?: string;
  tag?: string;
  variant?: "editorial" | "commerce";
}

export function ogImageForTitle(title: string, options: OgImageOptions = {}): string {
  const url = new URL("/og", siteUrl);
  url.searchParams.set("title", title);

  if (options.subtitle) {
    url.searchParams.set("subtitle", options.subtitle);
  }

  if (options.eyebrow) {
    url.searchParams.set("eyebrow", options.eyebrow);
  }

  if (options.tag) {
    url.searchParams.set("tag", options.tag);
  }

  if (options.variant) {
    url.searchParams.set("variant", options.variant);
  }

  return url.toString();
}
