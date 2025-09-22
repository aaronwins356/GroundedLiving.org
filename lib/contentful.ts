import "server-only";

import { cache } from "react";

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CONTENTFUL_DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const CONTENTFUL_BLOG_POST_CONTENT_TYPE =
  process.env.CONTENTFUL_BLOG_POST_CONTENT_TYPE || "blogPost";

type ContentfulSys = {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  revision?: number;
  locale?: string;
  contentType?: {
    sys: {
      id: string;
      linkType: string;
      type: string;
    };
  };
};

type ContentfulMetadata = {
  tags: Array<{
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
  }>;
};

type ContentfulLink = {
  sys: {
    type: "Link";
    linkType: string;
    id: string;
  };
};

type ContentfulAssetFile = {
  url?: string;
  fileName?: string;
  contentType?: string;
  details?: {
    size?: number;
    image?: {
      width?: number;
      height?: number;
    };
  };
};

type ContentfulAsset = {
  sys: ContentfulSys;
  fields: {
    title?: string;
    description?: string;
    file?: ContentfulAssetFile;
  };
  metadata: ContentfulMetadata;
};

type ContentfulRichTextMark = {
  type: string;
};

export type ContentfulRichTextNode = {
  nodeType: string;
  value?: string;
  marks?: ContentfulRichTextMark[];
  data?: Record<string, unknown>;
  content?: ContentfulRichTextNode[];
};

export type ContentfulRichTextDocument = {
  nodeType: "document";
  data: Record<string, unknown>;
  content: ContentfulRichTextNode[];
};

type BlogPostFields = {
  title?: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  summary?: string;
  publishedDate?: string;
  publishDate?: string;
  coverImage?: ContentfulLink;
  heroImage?: ContentfulLink;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  body?: ContentfulRichTextDocument;
  content?: ContentfulRichTextDocument;
  richText?: ContentfulRichTextDocument;
  tags?: string[];
};

type ContentfulEntry<TFields> = {
  sys: ContentfulSys & {
    contentType: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    };
  };
  fields: TFields;
  metadata: ContentfulMetadata;
};

type ContentfulCollection<TFields> = {
  items: Array<ContentfulEntry<TFields>>;
  includes?: {
    Asset?: ContentfulAsset[];
    Entry?: Array<ContentfulEntry<Record<string, unknown>>>;
  };
};

export type ContentfulImage = {
  url: string;
  alt?: string | null;
  width?: number;
  height?: number;
};

export type BlogCategory = {
  name: string;
  slug: string;
  color?: string | null;
};

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  excerpt?: string | null;
  description?: string | null;
  category?: BlogCategory | null;
  coverImage?: ContentfulImage | null;
  tags: string[];
};

export type BlogPost = BlogPostListItem & {
  content: ContentfulRichTextDocument | null;
  linkedAssets: Record<string, ContentfulImage>;
};

type ContentfulQueryParams = Record<string, string | number | undefined>;

type ContentfulConfig = {
  spaceId: string;
  environment: string;
  accessToken: string;
};

function getContentfulConfig(): ContentfulConfig | null {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_DELIVERY_TOKEN) {
    return null;
  }

  return {
    spaceId: CONTENTFUL_SPACE_ID,
    environment: CONTENTFUL_ENVIRONMENT,
    accessToken: CONTENTFUL_DELIVERY_TOKEN,
  };
}

function buildContentfulUrl(params: ContentfulQueryParams, config: ContentfulConfig): URL {
  const url = new URL(
    `/spaces/${config.spaceId}/environments/${config.environment}/entries`,
    "https://cdn.contentful.com",
  );
  const searchParams = url.searchParams;
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    searchParams.set(key, String(value));
  }
  return url;
}

async function fetchContentfulEntries<TFields>(params: ContentfulQueryParams) {
  const config = getContentfulConfig();
  if (!config) {
    return { items: [] } as ContentfulCollection<TFields>;
  }
  const url = buildContentfulUrl(params, config);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
    next: {
      revalidate: 60,
      tags: ["contentful", "blog"],
    },
  });

  if (!response.ok) {
    throw new Error(`Contentful request failed with status ${response.status}`);
  }

  return (await response.json()) as ContentfulCollection<TFields>;
}

function createAssetMap(assets: ContentfulAsset[] | undefined) {
  const map = new Map<string, ContentfulAsset>();
  if (!assets) {
    return map;
  }

  assets.forEach((asset) => {
    if (asset?.sys?.id) {
      map.set(asset.sys.id, asset);
    }
  });

  return map;
}

function normalizeUrl(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

function mapAsset(asset: ContentfulAsset | undefined): ContentfulImage | null {
  if (!asset) {
    return null;
  }

  const file = asset.fields.file;
  const normalizedUrl = normalizeUrl(file?.url);
  if (!normalizedUrl) {
    return null;
  }

  const dimensions = file?.details?.image;

  return {
    url: normalizedUrl,
    alt: asset.fields.description ?? asset.fields.title ?? null,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

function resolveLinkedAsset(link: ContentfulLink | undefined, assets: Map<string, ContentfulAsset>) {
  if (!link?.sys?.id) {
    return null;
  }
  return mapAsset(assets.get(link.sys.id));
}

function extractTags(entry: ContentfulEntry<BlogPostFields>): string[] {
  const tags = new Set<string>();

  entry.metadata?.tags?.forEach((tag) => {
    if (tag?.sys?.id) {
      tags.add(tag.sys.id);
    }
  });

  const fieldTags = entry.fields.tags;
  if (Array.isArray(fieldTags)) {
    fieldTags.forEach((tag) => {
      if (typeof tag === "string" && tag.trim()) {
        tags.add(tag.trim());
      }
    });
  }

  return Array.from(tags);
}

function mapCategory(fields: BlogPostFields): BlogCategory | null {
  const name = fields.categoryName?.trim();
  if (!name) {
    return null;
  }

  const explicitSlug = fields.categorySlug?.trim();
  const normalizedSlug = explicitSlug?.toLowerCase() || name.toLowerCase().replace(/\s+/g, "-");

  return {
    name,
    slug: normalizedSlug,
    color: fields.categoryColor ?? null,
  };
}

function mapBlogPost(
  entry: ContentfulEntry<BlogPostFields>,
  assets: Map<string, ContentfulAsset>,
): BlogPost | null {
  const slug = entry.fields.slug?.trim();
  if (!slug) {
    return null;
  }

  const contentField = entry.fields.body || entry.fields.content || entry.fields.richText || null;
  const coverImage = resolveLinkedAsset(entry.fields.coverImage || entry.fields.heroImage, assets);
  const linkedAssets: Record<string, ContentfulImage> = {};

  assets.forEach((asset, id) => {
    const mapped = mapAsset(asset);
    if (mapped) {
      linkedAssets[id] = mapped;
    }
  });

  return {
    id: entry.sys.id,
    slug,
    title: entry.fields.title?.trim() || "Untitled post",
    publishedAt:
      entry.fields.publishedDate ||
      entry.fields.publishDate ||
      entry.sys.updatedAt ||
      entry.sys.createdAt,
    excerpt: entry.fields.excerpt?.trim() || entry.fields.summary?.trim() || null,
    description: entry.fields.description?.trim() || null,
    category: mapCategory(entry.fields),
    coverImage,
    content: contentField,
    tags: extractTags(entry),
    linkedAssets,
  };
}

function mapBlogPostListItem(entry: ContentfulEntry<BlogPostFields>, assets: Map<string, ContentfulAsset>) {
  const mapped = mapBlogPost(entry, assets);
  if (!mapped) {
    return null;
  }

  const { content: _content, linkedAssets: _linkedAssets, ...listItem } = mapped;
  return listItem;
}

function sortByPublishedDate(posts: BlogPostListItem[]): BlogPostListItem[] {
  return [...posts].sort((a, b) => {
    const aTime = new Date(a.publishedAt).getTime();
    const bTime = new Date(b.publishedAt).getTime();
    return Number.isFinite(bTime) && Number.isFinite(aTime) ? bTime - aTime : 0;
  });
}

async function fetchBlogPostEntries(query: ContentfulQueryParams) {
  const params: ContentfulQueryParams = {
    content_type: CONTENTFUL_BLOG_POST_CONTENT_TYPE,
    include: 4,
    limit: 1000,
    order: "-fields.publishedDate",
    ...query,
  };

  return fetchContentfulEntries<BlogPostFields>(params);
}

export const getBlogPosts = cache(async (): Promise<BlogPostListItem[]> => {
  const collection = await fetchBlogPostEntries({});
  const assets = createAssetMap(collection.includes?.Asset);
  const posts = collection.items
    .map((entry) => mapBlogPostListItem(entry, assets))
    .filter((post): post is BlogPostListItem => Boolean(post));

  return sortByPublishedDate(posts);
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!slug) {
    return null;
  }

  const collection = await fetchBlogPostEntries({
    limit: 1,
    "fields.slug": slug,
  });

  const [entry] = collection.items;
  if (!entry) {
    return null;
  }

  const assets = createAssetMap(collection.includes?.Asset);
  return mapBlogPost(entry, assets);
});

export function getCategoryFilters(posts: BlogPostListItem[]): BlogCategory[] {
  const map = new Map<string, BlogCategory>();

  posts.forEach((post) => {
    if (post.category) {
      map.set(post.category.slug, post.category);
    }
  });

  return Array.from(map.values());
}
