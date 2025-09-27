import "server-only";

import { cache } from "react";

import type {
  BlogPost,
  BlogPostAuthor,
  BlogPostRecipe,
  BlogPostSummary,
  ContentfulCategory,
  ContentfulCollection,
  ContentfulImageAsset,
  ContentfulPage,
  GraphQLResponse,
  InfographicBlock,
  InfographicListItem,
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
      entries?: {
        block?: EntryLinkGraphQL[];
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
  seoTitle?: string | null;
  seoDescription?: string | null;
  affiliate?: boolean | null;
  affiliateCtaText?: string | null;
  affiliateCtaUrl?: string | null;
  sponsored?: boolean | null;
  sponsoredLabel?: string | null;
  disclosureNeeded?: boolean | null;
  disableAutoLinks?: boolean | null;
  recipe?: RecipeGraphQL | null;
}

interface RecipeGraphQL {
  name?: string | null;
  description?: string | null;
  yield?: string | null;
  prepTime?: string | number | null;
  cookTime?: string | number | null;
  totalTime?: string | number | null;
  ingredients?: Array<string | null> | null;
  instructions?: Array<string | null> | null;
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
      entries?: {
        block?: EntryLinkGraphQL[];
      };
    } | null;
  } | null;
}

interface CategoryGraphQL {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
}

export async function fetchContentfulGraphQL<T>(
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
    content: enrichRichText(
      page.content?.json ?? null,
      page.content?.links?.assets?.block ?? [],
      page.content?.links?.entries?.block ?? [],
    ),
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
    seoTitle: post.seoTitle ?? null,
    seoDescription: post.seoDescription ?? null,
  } satisfies BlogPostSummary;
}

function normalizeNullableString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapRecipe(recipe: RecipeGraphQL | null | undefined): BlogPostRecipe | null {
  if (!recipe) {
    return null;
  }

  const ingredients = (recipe.ingredients ?? [])
    .map((item) => normalizeNullableString(item ?? undefined))
    .filter((value): value is string => Boolean(value));

  const instructions = (recipe.instructions ?? [])
    .map((item) => normalizeNullableString(item ?? undefined))
    .filter((value): value is string => Boolean(value));

  const hasCoreDetails = ingredients.length > 0 || instructions.length > 0;
  const hasMetadata =
    normalizeNullableString(recipe.description) !== null ||
    normalizeNullableString(recipe.yield) !== null ||
    recipe.prepTime != null ||
    recipe.cookTime != null ||
    recipe.totalTime != null;

  if (!hasCoreDetails && !hasMetadata) {
    return null;
  }

  return {
    name: normalizeNullableString(recipe.name),
    description: normalizeNullableString(recipe.description),
    yield: normalizeNullableString(recipe.yield),
    prepTime:
      typeof recipe.prepTime === "number" ? recipe.prepTime : normalizeNullableString(recipe.prepTime ?? undefined),
    cookTime:
      typeof recipe.cookTime === "number" ? recipe.cookTime : normalizeNullableString(recipe.cookTime ?? undefined),
    totalTime:
      typeof recipe.totalTime === "number" ? recipe.totalTime : normalizeNullableString(recipe.totalTime ?? undefined),
    ingredients: ingredients.length > 0 ? ingredients : null,
    instructions: instructions.length > 0 ? instructions : null,
  } satisfies BlogPostRecipe;
}

function mapBlogPost(post: BlogPostGraphQL): BlogPost | null {
  const summary = mapBlogPostSummary(post);
  if (!summary) {
    return null;
  }

  return {
    ...summary,
    content: enrichRichText(
      post.content?.json ?? null,
      post.content?.links?.assets?.block ?? [],
      post.content?.links?.entries?.block ?? [],
    ),
    author: mapAuthor(post.author ?? null),
    seoDescription: post.seoDescription ?? null,
    affiliate: Boolean(post.affiliate),
    affiliateCtaText: post.affiliateCtaText ?? null,
    affiliateCtaUrl: post.affiliateCtaUrl ?? null,
    sponsored: Boolean(post.sponsored),
    sponsoredLabel: post.sponsoredLabel ?? null,
    disclosureNeeded: Boolean(post.disclosureNeeded),
    disableAutoLinks: Boolean(post.disableAutoLinks),
    recipe: mapRecipe(post.recipe ?? null),
  } satisfies BlogPost;
}

type InfographicEntryGraphQL = {
  __typename: "InfographicBlock";
  sys: { id: string };
  eyebrow?: string | null;
  title?: string | null;
  summary?: string | null;
  footnote?: string | null;
  theme?: string | null;
  itemsCollection?: {
    items?: Array<InfographicListItemGraphQL | null> | null;
  } | null;
  items?: Array<InfographicListItemGraphQL | null> | null;
};

type InfographicListItemGraphQL = {
  title?: string | null;
  description?: string | null;
};

type EntryLinkGraphQL = (InfographicEntryGraphQL & { sys: { id: string } }) | null | undefined;

export function enrichRichText(
  document: RichTextDocument | null,
  assets: Array<AssetGraphQL & { sys: { id: string } }> = [],
  entries: EntryLinkGraphQL[] = [],
): RichTextDocument | null {
  if (!document) {
    return document;
  }

  if (assets.length === 0 && entries.length === 0) {
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

  const entryMap = new Map(
    entries
      .map((entry) => mapEntryLink(entry))
      .filter((entry): entry is { id: string; block: { __typename: string; data: InfographicBlock } } => Boolean(entry))
      .map((entry) => [entry.id, entry.block]),
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

    if (node.nodeType === "embedded-entry-block") {
      const targetId =
        typeof node.data?.target === "object" && node.data?.target && "sys" in node.data.target
          ? (node.data.target as { sys?: { id?: string } }).sys?.id
          : undefined;

      const entry = targetId ? entryMap.get(targetId) : undefined;
      if (entry) {
        node.data = {
          ...(node.data ?? {}),
          target: entry,
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
          seoTitle
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
          seoTitle
          seoDescription
          coverImage { url title description width height }
          affiliate
          affiliateCtaText
          affiliateCtaUrl
          sponsored
          sponsoredLabel
          disclosureNeeded
          disableAutoLinks
          recipe {
            name
            description
            yield
            prepTime
            cookTime
            totalTime
            ingredients
            instructions
          }
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
              entries {
                block {
                  __typename
                  sys { id }
                  ... on InfographicBlock {
                    eyebrow
                    title
                    summary
                    footnote
                    theme
                    itemsCollection {
                      items {
                        title
                        description
                      }
                    }
                  }
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
              entries {
                block {
                  __typename
                  sys { id }
                  ... on InfographicBlock {
                    eyebrow
                    title
                    summary
                    footnote
                    theme
                    itemsCollection {
                      items {
                        title
                        description
                      }
                    }
                  }
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
              entries {
                block {
                  __typename
                  sys { id }
                  ... on InfographicBlock {
                    eyebrow
                    title
                    summary
                    footnote
                    theme
                    itemsCollection {
                      items {
                        title
                        description
                      }
                    }
                  }
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
function mapEntryLink(entry: EntryLinkGraphQL): { id: string; block: { __typename: string; data: InfographicBlock } } | null {
  if (!entry || entry.__typename !== "InfographicBlock" || !entry.sys?.id || !entry.title) {
    return null;
  }

  const itemsSource = entry.itemsCollection?.items ?? entry.items ?? [];
  const items = itemsSource
    .map((item) => mapInfographicItem(item))
    .filter((item): item is InfographicListItem => item !== null);

  if (items.length === 0) {
    return null;
  }

  const block: InfographicBlock = {
    id: entry.sys.id,
    eyebrow: entry.eyebrow ?? null,
    title: entry.title,
    summary: entry.summary ?? null,
    items,
    footnote: entry.footnote ?? null,
    theme: normalizeInfographicTheme(entry.theme),
  };

  return { id: entry.sys.id, block: { __typename: entry.__typename, data: block } };
}

function mapInfographicItem(item: InfographicListItemGraphQL | null | undefined): InfographicListItem | null {
  if (!item?.title) {
    return null;
  }

  return { title: item.title, description: item.description ?? null } satisfies InfographicListItem;
}

function normalizeInfographicTheme(theme: string | null | undefined): InfographicBlock["theme"] {
  switch (theme) {
    case "moss":
    case "spruce":
    case "saffron":
    case "linen":
      return theme;
    default:
      return "linen";
  }
}
