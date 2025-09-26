import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

import { enrichRichText, fetchContentfulGraphQL } from "@/lib/contentful";
import type { RichTextDocument } from "@/types/contentful";

interface CmsAsset {
  url: string;
  title?: string | null;
  description?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface CmsPage {
  title: string;
  slug: string;
  bodyRichText: RichTextDocument | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: CmsAsset | null;
}

export interface CmsAuthor {
  name: string;
  slug: string;
  bioRichText: RichTextDocument | null;
  headshotUrl?: string | null;
  socialLinks?: {
    linkedIn?: string | null;
    instagram?: string | null;
  } | null;
}

interface PageGraphQL {
  title?: string | null;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: CmsAsset | null;
  bodyRichText?: {
    json?: RichTextDocument | null;
    links?: {
      assets?: {
        block?: Array<LinkedAsset>;
      };
    } | null;
  } | null;
}

interface PageCollectionGraphQL {
  pageCollection?: {
    items?: PageGraphQL[] | null;
  } | null;
}

interface AuthorGraphQL {
  name?: string | null;
  slug?: string | null;
  headshot?: { url?: string | null } | null;
  bioRichText?: {
    json?: RichTextDocument | null;
    links?: {
      assets?: {
        block?: Array<LinkedAsset>;
      };
    } | null;
  } | null;
  linkedInUrl?: string | null;
  instagramUrl?: string | null;
}

interface AuthorCollectionGraphQL {
  authorCollection?: {
    items?: AuthorGraphQL[] | null;
  } | null;
}

type SeedPage = Omit<CmsPage, "bodyRichText"> & {
  bodyRichText: RichTextDocument | null;
};

type SeedAuthor = Omit<CmsAuthor, "bioRichText"> & {
  bioRichText: RichTextDocument | null;
};

type LinkedAsset = CmsAsset & {
  sys?: {
    id?: string | null;
  } | null;
};

type RichTextAssetBlock = CmsAsset & {
  sys: {
    id: string;
  };
};

const isContentfulConfigured = Boolean(
  process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_DELIVERY_TOKEN,
);

const SEED_PAGES_DIR = path.join(process.cwd(), "content/pages");
const SEED_AUTHORS_DIR = path.join(process.cwd(), "content/authors");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const contents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(contents) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    console.error(`Failed to read CMS seed: ${filePath}`, error);
    return null;
  }
}

async function getSeedPage(slug: string): Promise<CmsPage | null> {
  const filePath = path.join(SEED_PAGES_DIR, `${slug}.json`);
  const seed = await readJsonFile<SeedPage>(filePath);
  if (!seed) {
    return null;
  }

  return {
    ...seed,
    ogImage: seed.ogImage ?? null,
  } satisfies CmsPage;
}

async function getSeedAuthor(slug: string): Promise<CmsAuthor | null> {
  const filePath = path.join(SEED_AUTHORS_DIR, `${slug}.json`);
  const seed = await readJsonFile<SeedAuthor>(filePath);
  if (!seed) {
    return null;
  }

  return {
    ...seed,
    socialLinks: seed.socialLinks ?? null,
  } satisfies CmsAuthor;
}

function mapCmsAsset(asset: CmsAsset | null | undefined): CmsAsset | null {
  if (!asset?.url) {
    return null;
  }

  return {
    url: asset.url,
    title: asset.title ?? null,
    description: asset.description ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
  };
}

function mapPage(page: PageGraphQL | null | undefined): CmsPage | null {
  if (!page?.title || !page.slug) {
    return null;
  }

  const enrichedBody = enrichRichText(
    page.bodyRichText?.json ?? null,
    normalizeLinkedAssets(page.bodyRichText?.links?.assets?.block ?? []),
  );

  return {
    title: page.title,
    slug: page.slug,
    bodyRichText: enrichedBody,
    seoTitle: page.seoTitle ?? null,
    seoDescription: page.seoDescription ?? null,
    ogImage: mapCmsAsset(page.ogImage),
  } satisfies CmsPage;
}

function mapAuthor(author: AuthorGraphQL | null | undefined): CmsAuthor | null {
  if (!author?.name || !author.slug) {
    return null;
  }

  const enrichedBio = enrichRichText(
    author.bioRichText?.json ?? null,
    normalizeLinkedAssets(author.bioRichText?.links?.assets?.block ?? []),
  );

  return {
    name: author.name,
    slug: author.slug,
    bioRichText: enrichedBio,
    headshotUrl: author.headshot?.url ?? null,
    socialLinks: {
      linkedIn: author.linkedInUrl ?? null,
      instagram: author.instagramUrl ?? null,
    },
  } satisfies CmsAuthor;
}

const getPageFromContentful = cache(async (slug: string): Promise<CmsPage | null> => {
  if (!isContentfulConfigured) {
    return null;
  }

  const query = `
    query PageBySlug($slug: String!, $preview: Boolean!) {
      pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          title
          slug
          seoTitle
          seoDescription
          ogImage {
            url
            title
            description
            width
            height
          }
          bodyRichText {
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

  const data = await fetchContentfulGraphQL<PageCollectionGraphQL>(query, {
    variables: { slug, preview: false },
    tags: ["contentful:cms:page", `contentful:cms:page:${slug}`],
  });

  const page = data?.pageCollection?.items?.[0];
  return mapPage(page);
});

const getAuthorFromContentful = cache(async (slug: string): Promise<CmsAuthor | null> => {
  if (!isContentfulConfigured) {
    return null;
  }

  const query = `
    query AuthorBySlug($slug: String!, $preview: Boolean!) {
      authorCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          name
          slug
          linkedInUrl
          instagramUrl
          headshot {
            url
          }
          bioRichText {
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

  const data = await fetchContentfulGraphQL<AuthorCollectionGraphQL>(query, {
    variables: { slug, preview: false },
    tags: ["contentful:cms:author", `contentful:cms:author:${slug}`],
  });

  const author = data?.authorCollection?.items?.[0];
  return mapAuthor(author);
});

const getSeedPageSlugs = cache(async (): Promise<string[]> => {
  try {
    const entries = await fs.readdir(SEED_PAGES_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name.replace(/\.json$/, ""));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to read page seeds", error);
    }
    return [];
  }
});

export const getAllPageSlugs = cache(async (): Promise<string[]> => {
  const seedSlugs = await getSeedPageSlugs();

  if (!isContentfulConfigured) {
    return seedSlugs;
  }

  const query = `
    query AllPageSlugs($preview: Boolean!) {
      pageCollection(preview: $preview) {
        items {
          slug
        }
      }
    }
  `;

  const data = await fetchContentfulGraphQL<PageCollectionGraphQL>(query, {
    variables: { preview: false },
    tags: ["contentful:cms:page:index"],
  });

  const cmsSlugs = (data?.pageCollection?.items ?? [])
    .map((item) => item?.slug)
    .filter((slug): slug is string => Boolean(slug));

  const deduped = new Set([...seedSlugs, ...cmsSlugs]);
  return Array.from(deduped);
});

export const getPageBySlug = cache(async (slug: string): Promise<CmsPage | null> => {
  const cmsPage = await getPageFromContentful(slug);
  if (cmsPage) {
    return cmsPage;
  }

  return getSeedPage(slug);
});

export const getAuthorBySlug = cache(async (slug: string): Promise<CmsAuthor | null> => {
  const cmsAuthor = await getAuthorFromContentful(slug);
  if (cmsAuthor) {
    return cmsAuthor;
  }

  return getSeedAuthor(slug);
});

function normalizeLinkedAssets(assets: LinkedAsset[]): RichTextAssetBlock[] {
  return assets.reduce<RichTextAssetBlock[]>((acc, asset) => {
    const id = asset.sys?.id;
    if (!id || !asset.url) {
      return acc;
    }

    acc.push({
      url: asset.url,
      title: asset.title ?? undefined,
      description: asset.description ?? undefined,
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      sys: { id },
    });

    return acc;
  }, []);
}

