import "server-only";

import { cache } from "react";

import type {
  BlogPost,
  BlogPostAuthor,
  BlogPostSummary,
  ContentfulCategory,
  ContentfulCollection,
  ContentfulImageAsset,
  ContentfulPage,
  GraphQLResponse,
  RichTextDocument,
  RichTextNode,
} from "../types/contentful";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

const GRAPHQL_ENDPOINT =
  SPACE_ID && ENVIRONMENT
    ? `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`
    : null;

const DEFAULT_REVALIDATE_SECONDS = 300;

export const BLOG_POST_TAG = "contentful:blogPosts";
export const PAGE_TAG = "contentful:pages";
export const CATEGORY_TAG = "contentful:categories";

interface GraphQLFetchOptions {
  preview?: boolean;
  revalidate?: number;
  tags?: string[];
  variables?: Record<string, unknown>;
}

interface AssetGraphQL {
  url?: string | null;
  title?: string | null;
  description?: string | null;
  width?: number | null;
  height?: number | null;
}

interface BlogPostGraphQL {
  sys: { id: string };
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: {
    json?: RichTextDocument | null;
    links?: {
      assets?: {
        block?: Array<AssetGraphQL & { sys: { id: string } }>;
      };
    } | null;
  } | null;
  coverImage?: AssetGraphQL | null;
  author?: {
    name?: string | null;
    bio?: string | null;
    avatarImage?: AssetGraphQL | null;
  } | null;
  datePublished?: string | null;
  seoDescription?: string | null;
}

interface PageGraphQL {
  sys: { id: string };
  title?: string | null;
  slug?: string | null;
  navigationLabel?: string | null;
  navigationPriority?: number | null;
  heroImage?: AssetGraphQL | null;
  content?: {
    json?: RichTextDocument | null;
    links?: {
      assets?: {
        block?: Array<AssetGraphQL & { sys: { id: string } }>;
      };
    } | null;
  } | null;
}

interface CategoryGraphQL {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
}

async function fetchContentfulGraphQL<T>(
  query: string,
  { preview = false, revalidate = DEFAULT_REVALIDATE_SECONDS, tags, variables }: GraphQLFetchOptions = {},
): Promise<T | null> {
  if (!GRAPHQL_ENDPOINT) {
    console.warn("Contentful GraphQL endpoint is not configured. Check environment variables.");
    return null;
  }

  const token = preview ? PREVIEW_TOKEN : DELIVERY_TOKEN;

  if (!token) {
    console.warn("Missing Contentful access token. Returning null response to avoid runtime failures.");
    return null;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables, preview }),
    next: { revalidate, tags },
  });

  if (!response.ok) {
    console.error("Contentful GraphQL request failed", await response.text());
    return null;
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    console.error("Contentful GraphQL errors", json.errors);
    return null;
  }

  return json.data ?? null;
}

function mapAsset(asset: AssetGraphQL | null | undefined): ContentfulImageAsset | null {
  if (!asset || !asset.url) {
    return null;
  }

  return {
    url: asset.url,
    title: asset.title ?? undefined,
    description: asset.description ?? undefined,
    width: asset.width ?? undefined,
    height: asset.height ?? undefined,
  } satisfies ContentfulImageAsset;
}

function mapAuthor(author: BlogPostGraphQL["author"]): BlogPostAuthor | null {
  if (!author || !author.name) {
    return null;
  }

  return {
    name: author.name,
    bio: author.bio ?? null,
    avatarImage: mapAsset(author.avatarImage),
  } satisfies BlogPostAuthor;
}

function mapCategory(category: CategoryGraphQL | null | undefined): ContentfulCategory | null {
  if (!category || !category.name || !category.slug) {
    return null;
  }

  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
  } satisfies ContentfulCategory;
}

function mapPage(page: PageGraphQL): ContentfulPage | null {
  if (!page || !page.slug || !page.title) {
    return null;
  }

  return {
    id: page.sys.id,
    title: page.title,
    slug: page.slug,
    content: enrichRichText(page.content?.json ?? null, page.content?.links?.assets?.block ?? []),
    navigationLabel: page.navigationLabel ?? null,
    navigationPriority: page.navigationPriority ?? null,
    heroImage: mapAsset(page.heroImage ?? null),
  } satisfies ContentfulPage;
}

function mapBlogPostSummary(post: BlogPostGraphQL): BlogPostSummary | null {
  if (!post || !post.slug || !post.title) {
    return null;
  }

  return {
    id: post.sys.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    coverImage: mapAsset(post.coverImage ?? null),
    datePublished: post.datePublished ?? null,
  } satisfies BlogPostSummary;
}

function mapBlogPost(post: BlogPostGraphQL): BlogPost | null {
  const summary = mapBlogPostSummary(post);
  if (!summary) {
    return null;
  }

  return {
    ...summary,
    content: enrichRichText(post.content?.json ?? null, post.content?.links?.assets?.block ?? []),
    author: mapAuthor(post.author ?? null),
    seoDescription: post.seoDescription ?? null,
  } satisfies BlogPost;
}

function enrichRichText(
  document: RichTextDocument | null,
  assets: Array<AssetGraphQL & { sys: { id: string } }> = [],
): RichTextDocument | null {
  if (!document || assets.length === 0) {
    return document;
  }

  // Contentful's GraphQL API returns Rich Text JSON plus a parallel map of linked
  // assets. We stitch the asset metadata into each embedded node so the custom
  // renderer can output responsive figures without relying on the official SDK.
  const assetMap = new Map(
    assets
      .filter((asset) => asset.sys?.id && asset.url)
      .map((asset) => [asset.sys.id, asset]),
  );

  const clone = JSON.parse(JSON.stringify(document)) as RichTextDocument;

  const visit = (node: RichTextDocument | RichTextNode) => {
    if (node.nodeType === "embedded-asset-block") {
      const targetId =
        typeof node.data?.target === "object" && node.data?.target && "sys" in node.data.target
          ? (node.data.target as { sys?: { id?: string } }).sys?.id
          : undefined;

      const asset = targetId ? assetMap.get(targetId) : undefined;
      if (asset) {
        node.data = {
          ...(node.data ?? {}),
          target: {
            url: asset.url,
            description: asset.description ?? asset.title ?? undefined,
            title: asset.title ?? undefined,
            width: asset.width ?? undefined,
            height: asset.height ?? undefined,
          },
        };
      }
    }

    if (node.content) {
      node.content.forEach((child) => visit(child as RichTextNode));
    }
  };

  visit(clone);
  return clone;
}

const getAllBlogPostsInternal = cache(async (): Promise<BlogPostSummary[]> => {
  const query = `
    query BlogPosts {
      blogPostCollection(order: datePublished_DESC, preview: false) {
        items {
          sys { id }
          title
          slug
          excerpt
          datePublished
          seoDescription
          coverImage { url title description width height }
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<{ blogPostCollection?: ContentfulCollection<BlogPostGraphQL> }>(query, {
    tags: [BLOG_POST_TAG],
  });

  const items = data?.blogPostCollection?.items ?? [];
  return items.map(mapBlogPostSummary).filter((post): post is BlogPostSummary => post !== null);
});

export const getAllBlogPosts = async (): Promise<BlogPostSummary[]> => getAllBlogPostsInternal();

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const query = `
    query BlogPostBySlug($slug: String!, $preview: Boolean!) {
      blogPostCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          sys { id }
          title
          slug
          excerpt
          datePublished
          seoDescription
          coverImage { url title description width height }
          content {
            json
            links {
              assets {
                block {
                  sys { id }
                  url
                  title
                  description
                  width
                  height
                }
              }
            }
          }
          author {
            name
            bio
            avatarImage { url title description width height }
          }
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<{ blogPostCollection?: ContentfulCollection<BlogPostGraphQL> }>(query, {
    variables: { slug, preview: false },
    tags: [BLOG_POST_TAG, `contentful:post:${slug}`],
  });

  const item = data?.blogPostCollection?.items?.[0];
  return item ? mapBlogPost(item) : null;
});

export const getPages = cache(async (): Promise<ContentfulPage[]> => {
  const query = `
    query Pages {
      pageCollection(order: navigationPriority_ASC, preview: false) {
        items {
          sys { id }
          title
          slug
          navigationLabel
          navigationPriority
          heroImage { url title description width height }
          content {
            json
            links {
              assets {
                block {
                  sys { id }
                  url
                  title
                  description
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<{ pageCollection?: ContentfulCollection<PageGraphQL> }>(query, {
    tags: [PAGE_TAG],
  });

  const items = data?.pageCollection?.items ?? [];
  return items.map(mapPage).filter((page): page is ContentfulPage => page !== null);
});

export const getPageBySlug = cache(async (slug: string): Promise<ContentfulPage | null> => {
  const query = `
    query PageBySlug($slug: String!, $preview: Boolean!) {
      pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          sys { id }
          title
          slug
          navigationLabel
          navigationPriority
          heroImage { url title description width height }
          content {
            json
            links {
              assets {
                block {
                  sys { id }
                  url
                  title
                  description
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<{ pageCollection?: ContentfulCollection<PageGraphQL> }>(query, {
    variables: { slug, preview: false },
    tags: [PAGE_TAG, `contentful:page:${slug}`],
  });

  const item = data?.pageCollection?.items?.[0];
  return item ? mapPage(item) : null;
});

export const getCategories = cache(async (): Promise<ContentfulCategory[]> => {
  const query = `
    query Categories {
      categoryCollection(preview: false, order: name_ASC) {
        items {
          name
          slug
          description
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<{ categoryCollection?: ContentfulCollection<CategoryGraphQL> }>(query, {
    tags: [CATEGORY_TAG],
  });

  const items = data?.categoryCollection?.items ?? [];
  return items.map(mapCategory).filter((category): category is ContentfulCategory => category !== null);
});

export const getPostsByCategory = cache(async (_slug: string): Promise<BlogPostSummary[]> => {
  console.warn(
    "Category filtering is not supported by the current Contentful blogPost model. Returning an empty result set.",
  );
  return [];
});
