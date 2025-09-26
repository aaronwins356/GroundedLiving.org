import "server-only";

import matter from "gray-matter";
import { revalidateTag } from "next/cache";

import type { Dirent } from "node:fs";

import { fetchContentfulGraphQL } from "@/lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";
import { richTextToPlainText } from "@/lib/richtext";
import type { RichTextDocument } from "@/types/contentful";

export interface SearchDoc {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  url: string;
}

export interface SearchIndex {
  docs: SearchDoc[];
  lastBuilt: string;
}

export interface SearchResultSet {
  results: SearchDoc[];
  total: number;
  page: number;
  limit: number;
  tookMs: number;
}

const CACHE_MS = 10 * 60 * 1000;
export const SEARCH_INDEX_TAG = "search-index";
let cachedIndex: SearchIndex | null = null;
let cachedAt = 0;

export function getCachedIndex(): SearchIndex | null {
  if (!cachedIndex) {
    return null;
  }

  if (Date.now() - cachedAt > CACHE_MS) {
    return null;
  }

  return cachedIndex;
}

export function setCachedIndex(index: SearchIndex): void {
  cachedIndex = index;
  cachedAt = Date.now();
}

interface SearchIndexQueryResponse {
  blogPostCollection?: {
    items?: Array<{
      slug?: string | null;
      title?: string | null;
      excerpt?: string | null;
      seoDescription?: string | null;
      datePublished?: string | null;
      category?: { name?: string | null } | null;
      author?: { name?: string | null } | null;
      content?: { json?: RichTextDocument | null } | null;
    }> | null;
  } | null;
}

function normalizeExcerpt(value: string, maxLength = 200): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cutoff = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return `${slice.slice(0, cutoff).trimEnd()}…`;
}

function normalizeDate(value: string | null | undefined): string {
  if (!value) {
    return new Date(0).toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString();
  }

  return date.toISOString();
}

function defaultAuthor(name: string | null | undefined): string {
  return name?.trim() || "Grounded Living";
}

function defaultCategory(name: string | null | undefined): string {
  return name?.trim() || "Journal";
}

async function fetchCmsPosts(): Promise<SearchDoc[]> {
  const query = `
    query SearchIndexPosts {
      blogPostCollection(order: datePublished_DESC, preview: false) {
        items {
          slug
          title
          excerpt
          seoDescription
          datePublished
          category { name }
          author { name }
          content { json }
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<SearchIndexQueryResponse>(query, {
    tags: [SEARCH_INDEX_TAG],
    revalidate: CACHE_MS / 1000,
  });

  const items = data?.blogPostCollection?.items ?? [];

  return items
    .map((item) => {
      const slug = item?.slug?.trim();
      const title = item?.title?.trim();
      if (!slug || !title) {
        return null;
      }

      const excerptSource =
        item?.excerpt ??
        item?.seoDescription ??
        (item?.content ? richTextToPlainText(item.content.json ?? null) : "");
      const excerpt = normalizeExcerpt(excerptSource);
      const publishedAt = normalizeDate(item?.datePublished);

      return {
        id: slug,
        title,
        excerpt,
        category: defaultCategory(item?.category?.name ?? null),
        author: defaultAuthor(item?.author?.name ?? null),
        publishedAt,
        url: `/blog/${slug}`,
      } satisfies SearchDoc;
    })
    .filter((doc): doc is SearchDoc => Boolean(doc));
}

function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/!\s*\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadSeedPosts(): Promise<SearchDoc[]> {
  if (typeof process === "undefined" || process.env?.NEXT_RUNTIME === "edge") {
    return [];
  }

  const dynamicImport = new Function("specifier", "return import(specifier);") as <T>(specifier: string) => Promise<T>;

  try {
    const [fsModule, pathModule] = await Promise.all([
      dynamicImport<typeof import("node:fs/promises")>("node:fs/promises"),
      dynamicImport<typeof import("node:path")>("node:path"),
    ]);

    const seedsDir = pathModule.join(process.cwd(), "content/posts");
    const entries = await fsModule.readdir(seedsDir, { withFileTypes: true });
    const markdownFiles = entries.filter(
      (entry): entry is Dirent => entry.isFile() && /\.(md|mdx|json)$/i.test(entry.name),
    );

    const docs = await Promise.all(
      markdownFiles.map(async (entry): Promise<SearchDoc | null> => {
        const filePath = pathModule.join(seedsDir, entry.name);
        const contents = await fsModule.readFile(filePath, "utf8");

        if (entry.name.endsWith(".json")) {
          try {
            const json = JSON.parse(contents) as SearchDoc;
            if (json?.id && json?.title) {
              return json;
            }
          } catch (error) {
            console.warn(`Skipping invalid JSON seed: ${filePath}`, error);
          }
          return null;
        }

        const { data, content } = matter<Record<string, unknown>>(contents);
        const slug = (typeof data.slug === "string" ? data.slug : entry.name.replace(/\.(md|mdx)$/i, "")).trim();
        const title = typeof data.title === "string" ? data.title.trim() : slug.replace(/-/g, " ");
        const excerptSource =
          (typeof data.excerpt === "string" && data.excerpt) ||
          (typeof data.description === "string" && data.description) ||
          plainTextFromMarkdown(content ?? "");
        const publishedAt = normalizeDate(typeof data.date === "string" ? data.date : null);

        return {
          id: slug,
          title,
          excerpt: normalizeExcerpt(excerptSource),
          category: defaultCategory(typeof data.category === "string" ? data.category : null),
          author: defaultAuthor(typeof data.author === "string" ? data.author : null),
          publishedAt,
          url: `/blog/${slug}`,
        } satisfies SearchDoc;
      }),
    );

    return docs
      .filter((doc): doc is SearchDoc => Boolean(doc))
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to read seed posts", error);
    }
    return [];
  }
}

export async function buildSearchIndex(): Promise<SearchIndex> {
  const cmsDocs = await fetchCmsPosts();
  const docs = cmsDocs.length > 0 ? cmsDocs : await loadSeedPosts();

  const sorted = [...docs].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const index: SearchIndex = {
    docs: sorted,
    lastBuilt: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "production") {
    // TODO: Wire Contentful publish webhooks to call `revalidateTag('search-index')` once available.
    revalidateTag(SEARCH_INDEX_TAG);
  }

  return index;
}

function computeScore(doc: SearchDoc, term: string): number {
  if (!term) {
    return 0;
  }

  const normalized = term.toLowerCase();
  let score = 0;

  const title = doc.title.toLowerCase();
  const excerpt = doc.excerpt.toLowerCase();
  const category = doc.category.toLowerCase();

  if (title.includes(normalized)) {
    score += 3;
  }

  if (category.includes(normalized)) {
    score += 2;
  }

  if (excerpt.includes(normalized)) {
    score += 1;
  }

  return score;
}

export function searchIndexDocs(
  docs: SearchDoc[],
  query: string,
  page: number,
  limit: number,
): SearchResultSet {
  const start = performance.now();
  const trimmedQuery = query.trim();
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;

  const scored = docs
    .map((doc) => ({
      doc,
      score: computeScore(doc, trimmedQuery),
    }))
    .filter(({ score }) => (trimmedQuery ? score > 0 : true))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.doc.publishedAt === a.doc.publishedAt) {
        return a.doc.title.localeCompare(b.doc.title);
      }

      return b.doc.publishedAt.localeCompare(a.doc.publishedAt);
    })
    .map(({ doc }) => doc);

  const total = scored.length;
  const pageCount = Math.max(Math.ceil(total / normalizedLimit), 1);
  const safePage = Math.min(normalizedPage, pageCount);
  const startIndex = (safePage - 1) * normalizedLimit;
  const endIndex = startIndex + normalizedLimit;
  const results = scored.slice(startIndex, endIndex);
  const tookMs = Math.round(performance.now() - start);

  return {
    results,
    total,
    page: safePage,
    limit: normalizedLimit,
    tookMs,
  };
}

export function createSearchResultHref(slug: string): string {
  const canonical = canonicalFor(`/blog/${slug}`);
  return canonical.pathname;
}

export { CACHE_MS };
