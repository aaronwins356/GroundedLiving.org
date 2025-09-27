import type { BlogPost } from "@/types/contentful";
import { metaFromRichTextExcerpt } from "@/lib/seo/meta";
import { richTextToPlainText } from "@/lib/richtext";
import type { JsonLdObject } from "./schema";

import seoConfig from "../../next-seo.config";

const MAX_TITLE_LENGTH = 65;
const MAX_DESCRIPTION_LENGTH = 155;
const DEFAULT_AUTHOR = "Grounded Living";
const FALLBACK_IMAGE_URL = new URL("/og-image.svg", seoConfig.siteUrl).toString();

interface PostMetaImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface PostMeta {
  title: string;
  description: string;
  image: PostMetaImage;
  publishedTime: string | null;
  modifiedTime: string | null;
  authorName: string;
}

interface ArticleJsonLdOptions {
  canonicalUrl: string;
  title: string;
  description: string;
  imageUrl?: string;
  breadcrumb?: JsonLdObject | null;
  authorName: string;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

interface RecipeJsonLdOptions {
  canonicalUrl: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorName: string;
  datePublished?: string | null;
}

export function resolvePostMeta(post: BlogPost): PostMeta {
  const baseTitle = pickFirst([
    collapseWhitespace(post.seoTitle),
    collapseWhitespace(post.title),
    seoConfig.defaultTitle,
  ]);
  const title = truncateAtBoundary(baseTitle, MAX_TITLE_LENGTH);

  const description = truncateAtBoundary(
    pickFirst([
      collapseWhitespace(post.seoDescription),
      collapseWhitespace(post.excerpt),
      collapseWhitespace(metaFromRichTextExcerpt(post.content, MAX_DESCRIPTION_LENGTH)),
      seoConfig.defaultDescription,
    ]),
    MAX_DESCRIPTION_LENGTH,
  );

  const image = resolvePostImage(post);
  const authorName = pickFirst([collapseWhitespace(post.author?.name), DEFAULT_AUTHOR]);
  const publishedTime = post.datePublished ?? null;

  return {
    title,
    description,
    image,
    authorName,
    publishedTime,
    modifiedTime: publishedTime,
  } satisfies PostMeta;
}

export function buildArticleJsonLd(post: BlogPost, options: ArticleJsonLdOptions): JsonLdObject {
  const publishedTime = options.publishedTime ?? post.datePublished ?? new Date().toISOString();
  const modifiedTime = options.modifiedTime ?? publishedTime;

  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: options.title,
    description: options.description,
    url: options.canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": options.canonicalUrl,
    },
    datePublished: publishedTime,
    dateModified: modifiedTime,
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: options.authorName || DEFAULT_AUTHOR,
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_AUTHOR,
      logo: {
        "@type": "ImageObject",
        url: FALLBACK_IMAGE_URL,
      },
    },
  } satisfies JsonLdObject;

  if (options.imageUrl) {
    schema.image = [options.imageUrl];
  }

  if (options.breadcrumb) {
    schema.breadcrumb = options.breadcrumb;
  }

  const plainBody = richTextToPlainText(post.content);
  if (plainBody) {
    schema.articleBody = plainBody;
    const wordCount = plainBody.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0) {
      schema.wordCount = wordCount;
    }
  }

  return schema;
}

export function buildRecipeJsonLd(post: BlogPost, options: RecipeJsonLdOptions): JsonLdObject | null {
  const recipe = post.recipe;
  if (!recipe) {
    return null;
  }

  const ingredients = sanitizeList(recipe.ingredients);
  const instructions = sanitizeList(recipe.instructions);

  if (ingredients.length === 0 || instructions.length === 0) {
    return null;
  }

  const instructionSteps = instructions.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text: step,
  }));

  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: pickFirst([collapseWhitespace(recipe.name), options.title]),
    description: pickFirst([collapseWhitespace(recipe.description), options.description]),
    recipeIngredient: ingredients,
    recipeInstructions: instructionSteps,
    author: {
      "@type": "Person",
      name: options.authorName || DEFAULT_AUTHOR,
    },
    mainEntityOfPage: options.canonicalUrl,
  } satisfies JsonLdObject;

  if (options.imageUrl) {
    schema.image = [options.imageUrl];
  }

  const yieldValue = collapseWhitespace(recipe.yield);
  if (yieldValue) {
    schema.recipeYield = yieldValue;
  }

  const prepMinutes = parseDurationMinutes(recipe.prepTime);
  const cookMinutes = parseDurationMinutes(recipe.cookTime);
  const totalMinutes =
    parseDurationMinutes(recipe.totalTime) ?? ((prepMinutes ?? 0) + (cookMinutes ?? 0) || undefined);

  const prepDuration = minutesToDuration(prepMinutes);
  if (prepDuration) {
    schema.prepTime = prepDuration;
  }

  const cookDuration = minutesToDuration(cookMinutes);
  if (cookDuration) {
    schema.cookTime = cookDuration;
  }

  const totalDuration = minutesToDuration(totalMinutes);
  if (totalDuration) {
    schema.totalTime = totalDuration;
  }

  if (options.datePublished) {
    schema.datePublished = options.datePublished;
  }

  return schema;
}

function collapseWhitespace(value?: string | null): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function pickFirst<T extends string>(values: T[]): T {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return values[values.length - 1];
}

function truncateAtBoundary(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > Math.floor(maxLength * 0.6) ? slice.slice(0, lastSpace) : slice;
  return `${base.replace(/[.…]+$/u, "").trimEnd()}…`;
}

function resolvePostImage(post: BlogPost): PostMetaImage {
  if (post.coverImage?.url) {
    const alt = pickFirst([
      collapseWhitespace(post.coverImage.description),
      collapseWhitespace(post.coverImage.title),
      collapseWhitespace(post.title),
      "Featured image",
    ]);

    return {
      url: `${post.coverImage.url}?w=1200&h=630&fit=fill`,
      alt,
      width: 1200,
      height: 630,
    } satisfies PostMetaImage;
  }

  return {
    url: FALLBACK_IMAGE_URL,
    alt: "Grounded Living cover art",
    width: 1200,
    height: 630,
  } satisfies PostMetaImage;
}

function sanitizeList(values?: string[] | null): string[] {
  return (values ?? [])
    .map((value) => collapseWhitespace(value))
    .filter((value) => value.length > 0);
}

function parseDurationMinutes(value: string | number | null | undefined): number | undefined {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return undefined;
    }
    return Math.round(value);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^P/i.test(trimmed)) {
    let minutes = 0;
    const dayMatch = trimmed.match(/(\d+)D/i);
    if (dayMatch) {
      minutes += Number.parseInt(dayMatch[1] ?? "0", 10) * 1440;
    }
    const hourMatch = trimmed.match(/(\d+)H/i);
    if (hourMatch) {
      minutes += Number.parseInt(hourMatch[1] ?? "0", 10) * 60;
    }
    const minuteMatch = trimmed.match(/(\d+)M/i);
    if (minuteMatch) {
      minutes += Number.parseInt(minuteMatch[1] ?? "0", 10);
    }
    const secondMatch = trimmed.match(/(\d+)S/i);
    if (secondMatch) {
      minutes += Math.round(Number.parseInt(secondMatch[1] ?? "0", 10) / 60);
    }
    return minutes > 0 ? minutes : undefined;
  }

  let totalMinutes = 0;
  const hoursMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)\b/i);
  if (hoursMatch) {
    totalMinutes += Math.round(Number.parseFloat(hoursMatch[1]) * 60);
  }

  const minutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|m)\b/i);
  if (minutesMatch) {
    totalMinutes += Math.round(Number.parseFloat(minutesMatch[1]));
  }

  if (totalMinutes === 0) {
    const numeric = Number.parseFloat(trimmed);
    if (!Number.isNaN(numeric)) {
      totalMinutes = Math.round(numeric);
    }
  }

  return totalMinutes > 0 ? totalMinutes : undefined;
}

function minutesToDuration(minutes?: number): string | undefined {
  if (!minutes || minutes <= 0) {
    return undefined;
  }

  return `PT${minutes}M`;
}
