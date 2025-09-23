import "server-only";

import { unstable_cache } from "next/cache";
import type { Asset, EntryCollection } from "contentful";
import { createClient } from "contentful";
import type { RichTextDocument, RichTextNode } from "@/lib/rich-text";
import { BLOCKS } from "@/lib/rich-text";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN;

const FALLBACK_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+q0P+WAAAAABJRU5ErkJggg==";

export type ContentfulImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string | null;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date: string;
  category: CategorySummary | null;
  coverImage: ContentfulImage | null;
};

export type Post = PostSummary & {
  body: RichTextDocument | null;
  seoDescription: string | null;
  imageGallery: ContentfulImage[];
  assets: Record<string, ContentfulImage>;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: RichTextDocument | null;
};

export type PageSummary = Pick<Page, "id" | "title" | "slug"> & { href?: string };

type PostFields = {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: RichTextDocument;
  coverImage?: Asset;
  category?: BasicEntry<CategoryFields>;
  date?: string;
};

type CategoryFields = {
  name?: string;
  slug?: string;
};

type PageFields = {
  title?: string;
  slug?: string;
  content?: RichTextDocument;
};

type SysFields = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type BasicEntry<TFields> = {
  sys: SysFields;
  fields: TFields;
};

function getBaseClient(preview = false) {
  if (!SPACE_ID || !DELIVERY_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Contentful credentials are not configured. Returning empty collections.");
    }
    return null;
  }

  if (preview && !PREVIEW_TOKEN) {
    console.warn("CONTENTFUL_PREVIEW_TOKEN is missing. Falling back to delivery API.");
  }

  return createClient({
    space: SPACE_ID,
    environment: ENVIRONMENT,
    accessToken: preview && PREVIEW_TOKEN ? PREVIEW_TOKEN : DELIVERY_TOKEN,
    host: preview && PREVIEW_TOKEN ? "preview.contentful.com" : undefined,
  });
}

async function fetchEntries<TFields>(
  params: Record<string, unknown>,
  options?: { preview?: boolean; contentType: string },
): Promise<EntryCollection<BasicEntry<TFields>>> {
  const client = getBaseClient(options?.preview);
  if (!client) {
    return { items: [] } as EntryCollection<BasicEntry<TFields>>;
  }

  return client.getEntries<TFields>({
    content_type: options?.contentType,
    include: 3,
    order: "-fields.date",
    ...params,
  }) as unknown as EntryCollection<BasicEntry<TFields>>;
}

function normalizeAsset(asset?: Asset | null): ContentfulImage | null {
  if (!asset || !asset.fields || !asset.fields.file) {
    return null;
  }

  const file = asset.fields.file as { url?: string; details?: { image?: { width?: number; height?: number } } };
  const url = file.url ? (file.url.startsWith("http") ? file.url : `https:${file.url}`) : null;

  if (!url) {
    return null;
  }

  const alt = asset.fields.description || asset.fields.title || null;

  return {
    url,
    width: file.details?.image?.width,
    height: file.details?.image?.height,
    alt,
  };
}

function normalizeCategory(entry?: BasicEntry<CategoryFields> | null): CategorySummary | null {
  const name = entry?.fields?.name?.trim();
  const slug = entry?.fields?.slug?.trim();

  if (!entry || !name || !slug) {
    return null;
  }

  return {
    id: entry.sys.id,
    name,
    slug,
  };
}

function mapPost(entry: BasicEntry<PostFields>): Post {
  const slug = entry.fields.slug?.trim() ?? entry.sys.id;
  const category = normalizeCategory(entry.fields.category);
  const coverImage = normalizeAsset(entry.fields.coverImage) ?? null;

  const allAssets = (entry.fields.body as RichTextDocument | undefined)?.content
    ?.flatMap((node) => extractAssetFromNode(node))
    .filter(Boolean) as Asset[] | undefined;

  const gallery = allAssets?.map((asset) => normalizeAsset(asset)).filter(Boolean) as ContentfulImage[] | undefined;
  const assetMap: Record<string, ContentfulImage> = {};

  allAssets?.forEach((asset) => {
    const normalized = normalizeAsset(asset);
    if (asset?.sys?.id && normalized) {
      assetMap[asset.sys.id] = normalized;
    }
  });

  return {
    id: entry.sys.id,
    slug,
    title: entry.fields.title?.trim() ?? "Untitled Post",
    excerpt: entry.fields.excerpt?.trim() ?? null,
    date: entry.fields.date ?? entry.sys.updatedAt ?? entry.sys.createdAt,
    category,
    coverImage: coverImage ?? (gallery?.[0] ?? null),
    body: entry.fields.body ?? null,
    seoDescription: entry.fields.excerpt?.trim() ?? null,
    imageGallery: gallery ?? [],
    assets: assetMap,
  };
}

function extractAssetFromNode(node: RichTextNode): (Asset | null)[] {
  const collected: (Asset | null)[] = [];
  if (node.nodeType === BLOCKS.EMBEDDED_ASSET) {
    const target = (node.data as { target?: Asset } | undefined)?.target ?? null;
    collected.push(target ?? null);
  }
  if (node.content) {
    node.content.forEach((child) => {
      collected.push(...extractAssetFromNode(child));
    });
  }
  return collected;
}

function mapPostSummary(entry: BasicEntry<PostFields>): PostSummary {
  const post = mapPost(entry);
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    coverImage: post.coverImage,
  };
}

function mapPage(entry: BasicEntry<PageFields>): Page {
  const slug = entry.fields.slug?.trim() ?? entry.sys.id;
  return {
    id: entry.sys.id,
    title: entry.fields.title?.trim() ?? "Untitled Page",
    slug,
    content: entry.fields.content ?? null,
  };
}

function sortByDate<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const getPostsCached = unstable_cache(
  async (preview = false) => {
    const { items } = await fetchEntries<PostFields>({ order: "-fields.date" }, { contentType: "post", preview });
    return items.map(mapPostSummary).filter((post) => Boolean(post.slug));
  },
  ["contentful-posts"],
  { tags: ["posts"] },
);

export async function getPosts(options?: { preview?: boolean }): Promise<PostSummary[]> {
  const posts = await getPostsCached(options?.preview ?? false);
  return sortByDate(posts);
}

const getPostBySlugCached = unstable_cache(
  async (slug: string, preview = false) => {
    if (!slug) {
      return null;
    }

    const { items } = await fetchEntries<PostFields>({
      limit: 1,
      "fields.slug": slug,
    }, { contentType: "post", preview });

    const entry = items[0];
    return entry ? mapPost(entry) : null;
  },
  ["contentful-post-by-slug"],
  { tags: ["posts"] },
);

export async function getPostBySlug(slug: string, options?: { preview?: boolean }): Promise<Post | null> {
  return getPostBySlugCached(slug, options?.preview ?? false);
}

const getCategoriesCached = unstable_cache(
  async () => {
    const { items } = await fetchEntries<CategoryFields>({ order: "fields.name" }, { contentType: "category" });
    return items
      .map((entry) => ({
        id: entry.sys.id,
        name: entry.fields.name?.trim() ?? "Untitled",
        slug: entry.fields.slug?.trim() ?? entry.sys.id,
      }))
      .filter((category) => Boolean(category.slug));
  },
  ["contentful-categories"],
  { tags: ["categories"] },
);

export async function getCategories(): Promise<CategorySummary[]> {
  const categories = await getCategoriesCached();
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

const getCategoryPostsCached = unstable_cache(
  async (slug: string) => {
    if (!slug) {
      return [];
    }

    const { items } = await fetchEntries<PostFields>({
      "fields.category.fields.slug": slug,
    }, { contentType: "post" });

    return items.map(mapPostSummary);
  },
  ["contentful-category-posts"],
  { tags: ["posts", "categories"] },
);

export async function getPostsByCategory(slug: string): Promise<PostSummary[]> {
  const posts = await getCategoryPostsCached(slug);
  return sortByDate(posts);
}

const getPagesCached = unstable_cache(
  async () => {
    const { items } = await fetchEntries<PageFields>({ order: "fields.title" }, { contentType: "page" });
    return items.map(mapPage);
  },
  ["contentful-pages"],
  { tags: ["pages"] },
);

export async function getPages(): Promise<Page[]> {
  return getPagesCached();
}

export async function getPageSummaries(): Promise<PageSummary[]> {
  const pages = await getPagesCached();
  return pages.map(({ id, slug, title }) => ({ id, slug, title }));
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  if (!slug) {
    return null;
  }

  const pages = (await getPagesCached()).filter((page) => page.slug === slug);
  return pages[0] ?? null;
}

export function getFeaturedPosts(posts: PostSummary[], count = 3): PostSummary[] {
  return posts.slice(0, count);
}

export function getLatestPosts(posts: PostSummary[], offset = 0, limit = 6): PostSummary[] {
  return posts.slice(offset, offset + limit);
}

export function getPlaceholderImage(): ContentfulImage {
  return { url: FALLBACK_IMAGE, alt: "" };
}

export function buildAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.groundedliving.org";
  return new URL(path, baseUrl).toString();
}
