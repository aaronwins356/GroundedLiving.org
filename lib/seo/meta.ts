import { siteUrl } from "@/lib/site";
import { richTextToPlainText } from "@/lib/richtext";
import type { RichTextDocument } from "@/types/contentful";

export function canonicalFor(path: string): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const cleanedPath = normalizedPath === "/" ? "/" : normalizedPath.replace(/\/+$/, "");
  return new URL(cleanedPath, siteUrl);
}

export function metaFromRichTextExcerpt(document: RichTextDocument | null, maxLength = 160): string {
  const plainText = richTextToPlainText(document);
  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const slice = plainText.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cutoff = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return `${slice.slice(0, cutoff).trimEnd()}…`;
}
