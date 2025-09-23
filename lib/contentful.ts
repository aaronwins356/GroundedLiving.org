import "server-only";

import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import type {
  Asset,
  ClientApi,
  EntryCollection,
  EntryFieldTypes,
  EntrySkeletonType,
} from "contentful";
import { createClient } from "contentful";

import type { RichTextDocument, RichTextNode } from "@/lib/rich-text";
import { BLOCKS } from "@/lib/rich-text";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

export const CONTENTFUL_REVALIDATE_INTERVAL = Number.parseInt(
  process.env.CONTENTFUL_REVALIDATE_INTERVAL ?? "120",
  10,
);

export const contentfulTags = {
  posts: "contentful:posts",
  pages: "contentful:pages",
  categories: "contentful:categories",
  authors: "contentful:authors",
} as const;

export interface ContentfulImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface AuthorSummary {
  id: string;
  name: string;
  bio?: string | null;
  avatar?: ContentfulImage | null;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: ContentfulImage | null;
  category: CategorySummary | null;
  author: AuthorSummary | null;
  tags: string[];
  datePublished: string;
  affiliate: boolean;
  seoDescription?: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: RichTextDocument | null;
  seoDescription: string | null;
  assets: Record<string, ContentfulImage>;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  content: RichTextDocument | null;
  heroImage: ContentfulImage | null;
  seoDescription: string | null;
}

export type PageSummary = Pick<SitePage, "id" | "title" | "slug"> & { href?: string };

const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+q0P+WAAAAABJRU5ErkJggg==";

interface BlogPostFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Symbol;
  excerpt: EntryFieldTypes.Text;
  content: EntryFieldTypes.RichText;
  coverImage: EntryFieldTypes.AssetLink;
  author: EntryFieldTypes.EntryLink<AuthorSkeleton>;
  category: EntryFieldTypes.EntryLink<CategorySkeleton>;
  tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
  datePublished: EntryFieldTypes.Date;
  seoDescription: EntryFieldTypes.Text;
  affiliate: EntryFieldTypes.Boolean;
}

interface CategoryFields {
  name: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Symbol;
  description: EntryFieldTypes.Text;
}

interface AuthorFields {
  name: EntryFieldTypes.Text;
  bio: EntryFieldTypes.Text;
  avatarImage: EntryFieldTypes.AssetLink;
}

interface PageFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Symbol;
  content: EntryFieldTypes.RichText;
  heroImage: EntryFieldTypes.AssetLink;
  seoDescription: EntryFieldTypes.Text;
}

type BlogPostSkeleton = EntrySkeletonType<BlogPostFields, "blogPost">;
type CategorySkeleton = EntrySkeletonType<CategoryFields, "category">;
type AuthorSkeleton = EntrySkeletonType<AuthorFields, "author">;
type PageSkeleton = EntrySkeletonType<PageFields, "page">;

type FetchOptions = {
  preview?: boolean;
};

type ContentfulClient = ClientApi<undefined>;

const createContentfulClient = cache((preview = false): ContentfulClient | null => {
  if (!SPACE_ID || !DELIVERY_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Missing Contentful credentials. Returning null client.");
    }
    return null;
  }

  if (preview && !PREVIEW_TOKEN) {
    console.warn("CONTENTFUL_PREVIEW_TOKEN is not configured. Using delivery token.");
  }

  return createClient({
    space: SPACE_ID,
    environment: ENVIRONMENT,
    accessToken: preview && PREVIEW_TOKEN ? PREVIEW_TOKEN : DELIVERY_TOKEN,
    host: preview && PREVIEW_TOKEN ? "preview.contentful.com" : undefined,
  });
});

async function fetchEntries<TSkeleton extends EntrySkeletonType<undefined, string>>(
  query: Record<string, unknown>,
  options: FetchOptions & { contentType: TSkeleton["contentTypeId"]; preview?: boolean },
): Promise<EntryCollection<TSkeleton>> {
  const client = createContentfulClient(options.preview ?? false);
  if (!client) {
    return { items: [] } as EntryCollection<TSkeleton>;
  }

  return client.getEntries<TSkeleton>({
    content_type: options.contentType,
    include: 4,
    order: "-fields.datePublished",
    ...query,
  });
}

function normaliseAsset(asset?: Asset | null): ContentfulImage | null {
  if (!asset) {
    return null;
  }

  const file = asset.fields.file as { url?: string; details?: { image?: { width?: number; height?: number } } };
  if (!file?.url) {
    return null;
  }

  const url = file.url.startsWith("http") ? file.url : `https:${file.url}`;

  return {
    url,
    width: file.details?.image?.width,
    height: file.details?.image?.height,
    alt: (asset.fields.description as string | undefined) ?? (asset.fields.title as string | undefined) ?? null,
  };
}

function normaliseCategory(entry?: CategorySkeleton | null): CategorySummary | null {
  if (!entry) {
    return null;
  }

  const name = (entry.fields.name as string | undefined)?.trim();
  const slug = (entry.fields.slug as string | undefined)?.trim();
  if (!name || !slug) {
    return null;
  }

  return {
    id: entry.sys.id,
    name,
    slug,
    description: ((entry.fields.description as string | undefined) ?? null)?.trim() ?? null,
  };
}

function normaliseAuthor(entry?: AuthorSkeleton | null): AuthorSummary | null {
  if (!entry) {
    return null;
  }

  const name = (entry.fields.name as string | undefined)?.trim();
  if (!name) {
    return null;
  }

  return {
    id: entry.sys.id,
    name,
    bio: ((entry.fields.bio as string | undefined) ?? null)?.trim() ?? null,
    avatar: normaliseAsset(entry.fields.avatarImage as unknown as Asset),
  };
}

function extractAssetsFromRichText(node: RichTextNode): Asset[] {
  const results: Asset[] = [];

  if (node.nodeType === BLOCKS.EMBEDDED_ASSET) {
    const target = (node.data as { target?: Asset } | undefined)?.target;
    if (target) {
      results.push(target);
    }
  }

  node.content?.forEach((child) => {
    results.push(...extractAssetsFromRichText(child));
  });

  return results;
}

function mapBlogPost(entry: BlogPostSkeleton): BlogPost {
  const slug = (entry.fields.slug as string | undefined)?.trim() ?? entry.sys.id;
  const content = (entry.fields.content as RichTextDocument | null) ?? null;
  const relatedAssets = content?.content.flatMap((block) => extractAssetsFromRichText(block)) ?? [];

  const assets: Record<string, ContentfulImage> = {};
  relatedAssets.forEach((asset) => {
    const mapped = normaliseAsset(asset);
    if (asset.sys.id && mapped) {
      assets[asset.sys.id] = mapped;
    }
  });

  const cover = normaliseAsset(entry.fields.coverImage as unknown as Asset) ?? null;

  return {
    id: entry.sys.id,
    slug,
    title: (entry.fields.title as string | undefined)?.trim() ?? "Untitled",
    excerpt: ((entry.fields.excerpt as string | undefined) ?? null)?.trim() ?? null,
    coverImage: cover,
    category: normaliseCategory(entry.fields.category as unknown as CategorySkeleton),
    author: normaliseAuthor(entry.fields.author as unknown as AuthorSkeleton),
    tags: Array.isArray(entry.fields.tags)
      ? (entry.fields.tags as string[]).map((tag) => tag.trim()).filter(Boolean)
      : [],
    datePublished: (entry.fields.datePublished as string | undefined) ?? entry.sys.updatedAt ?? entry.sys.createdAt,
    affiliate: Boolean(entry.fields.affiliate),
    content,
    seoDescription: ((entry.fields.seoDescription as string | undefined) ?? null)?.trim() ?? null,
    assets,
  };
}

function mapBlogPostSummary(entry: BlogPostSkeleton): BlogPostSummary {
  const mapped = mapBlogPost(entry);
  return {
    id: mapped.id,
    slug: mapped.slug,
    title: mapped.title,
    excerpt: mapped.excerpt,
    coverImage: mapped.coverImage,
    category: mapped.category,
    author: mapped.author,
    tags: mapped.tags,
    datePublished: mapped.datePublished,
    affiliate: mapped.affiliate,
    seoDescription: mapped.seoDescription,
  };
}

function mapPage(entry: PageSkeleton): SitePage {
  const slug = (entry.fields.slug as string | undefined)?.trim() ?? entry.sys.id;
  return {
    id: entry.sys.id,
    title: (entry.fields.title as string | undefined)?.trim() ?? "Untitled Page",
    slug,
    content: (entry.fields.content as RichTextDocument | null) ?? null,
    heroImage: normaliseAsset(entry.fields.heroImage as unknown as Asset),
    seoDescription: ((entry.fields.seoDescription as string | undefined) ?? null)?.trim() ?? null,
  };
}

const getBlogPostsCached = unstable_cache(
  async (preview = false) => {
    const { items } = await fetchEntries<BlogPostSkeleton>({}, { contentType: "blogPost", preview });
    return items.map(mapBlogPostSummary).filter((post) => Boolean(post.slug));
  },
  ["contentful:blogPosts"],
  { tags: [contentfulTags.posts], revalidate: CONTENTFUL_REVALIDATE_INTERVAL },
);

export async function getBlogPosts(options?: { preview?: boolean }): Promise<BlogPostSummary[]> {
  const posts = await getBlogPostsCached(options?.preview ?? false);
  return posts.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
}

const getBlogPostBySlugCached = unstable_cache(
  async (slug: string, preview = false) => {
    if (!slug) {
      return null;
    }

    const { items } = await fetchEntries<BlogPostSkeleton>({
      limit: 1,
      "fields.slug": slug,
    }, { contentType: "blogPost", preview });

    const entry = items[0];
    return entry ? mapBlogPost(entry) : null;
  },
  ["contentful:blogPost"],
  { tags: [contentfulTags.posts], revalidate: CONTENTFUL_REVALIDATE_INTERVAL },
);

export async function getBlogPostBySlug(slug: string, options?: { preview?: boolean }): Promise<BlogPost | null> {
  return getBlogPostBySlugCached(slug, options?.preview ?? false);
}

const getCategoriesCached = unstable_cache(
  async () => {
    const { items } = await fetchEntries<CategorySkeleton>({ order: "fields.name" }, { contentType: "category" });
    return items
      .map((entry) => normaliseCategory(entry))
      .filter((category): category is CategorySummary => Boolean(category));
  },
  ["contentful:categories"],
  { tags: [contentfulTags.categories], revalidate: CONTENTFUL_REVALIDATE_INTERVAL },
);

export async function getCategories(): Promise<CategorySummary[]> {
  const categories = await getCategoriesCached();
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

const getPagesCached = unstable_cache(
  async () => {
    const { items } = await fetchEntries<PageSkeleton>({ order: "fields.title" }, { contentType: "page" });
    return items.map(mapPage);
  },
  ["contentful:pages"],
  { tags: [contentfulTags.pages], revalidate: CONTENTFUL_REVALIDATE_INTERVAL },
);

export async function getPages(): Promise<SitePage[]> {
  return getPagesCached();
}

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  if (!slug) {
    return null;
  }

  const pages = await getPagesCached();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getPageSummaries(): Promise<PageSummary[]> {
  const pages = await getPagesCached();
  return pages.map(({ id, title, slug }) => ({ id, title, slug, href: `/pages/${slug}` }));
}

const getAuthorsCached = unstable_cache(
  async () => {
    const { items } = await fetchEntries<AuthorSkeleton>({ order: "fields.name" }, { contentType: "author" });
    return items
      .map((entry) => normaliseAuthor(entry))
      .filter((author): author is AuthorSummary => Boolean(author));
  },
  ["contentful:authors"],
  { tags: [contentfulTags.authors], revalidate: CONTENTFUL_REVALIDATE_INTERVAL },
);

export async function getAuthors(): Promise<AuthorSummary[]> {
  return getAuthorsCached();
}

const getPostsByCategoryCached = unstable_cache(
  async (slug: string) => {
    if (!slug) {
      return [];
    }

    const { items } = await fetchEntries<BlogPostSkeleton>(
      {
        "fields.category.fields.slug": slug,
      },
      { contentType: "blogPost" },
    );

    return items.map(mapBlogPostSummary);
  },
  ["contentful:postsByCategory"],
  { tags: [contentfulTags.posts, contentfulTags.categories], revalidate: CONTENTFUL_REVALIDATE_INTERVAL },
);

export async function getBlogPostsByCategory(slug: string): Promise<BlogPostSummary[]> {
  const posts = await getPostsByCategoryCached(slug);
  return posts.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
}

export async function getRelatedBlogPosts(
  post: BlogPostSummary,
  limit = 3,
): Promise<BlogPostSummary[]> {
  const posts = await getBlogPosts();
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .filter((candidate) =>
      post.category ? candidate.category?.slug === post.category.slug : candidate.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, limit);
}

export function getPlaceholderImage(): ContentfulImage {
  return { url: FALLBACK_IMAGE, alt: "" };
}

export function buildAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.groundedliving.org";
  return new URL(path, baseUrl).toString();
}

export function revalidateContentfulTags(...tags: (keyof typeof contentfulTags)[]) {
  tags.forEach((tag) => revalidateTag(contentfulTags[tag]));
}

export function selectFeaturedPosts(posts: BlogPostSummary[], count = 3): BlogPostSummary[] {
  return posts.slice(0, count);
}

export function paginatePosts(
  posts: BlogPostSummary[],
  page: number,
  pageSize: number,
): { entries: BlogPostSummary[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  return {
    entries: posts.slice(start, start + pageSize),
    totalPages,
  };
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getSeoDescription(post: BlogPost | BlogPostSummary): string {
  return post.seoDescription ?? post.excerpt ?? "";
}

