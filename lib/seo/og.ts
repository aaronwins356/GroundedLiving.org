import { siteUrl } from "@/lib/site";

export function ogImageForTitle(title: string): string {
  const url = new URL("/og", siteUrl);
  url.searchParams.set("title", title);
  return url.toString();
}
