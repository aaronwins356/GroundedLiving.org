import "server-only";

import * as prismic from "@prismicio/client";

import { client } from "../prismicio";

export type PrismicImage = {
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
  uid: string;
  title: string;
  publishedAt: string;
  excerpt?: string | null;
  category?: BlogCategory | null;
  coverImage?: PrismicImage | null;
};

export type BlogPost = BlogPostListItem & {
  content: prismic.RichTextField;
};

export type PageDocument = {
  id: string;
  uid: string;
  title: string;
  content: prismic.RichTextField;
  coverImage?: PrismicImage | null;
};

type PostDocumentData = {
  title: prismic.TitleField;
  date: prismic.DateField;
  category: prismic.KeyTextField | null;
  category_slug: prismic.KeyTextField | null;
  category_color: prismic.ColorField | null;
  excerpt: prismic.RichTextField;
  body: prismic.RichTextField;
  cover_image: prismic.ImageField;
};

type PageDocumentData = {
  title: prismic.TitleField;
  content: prismic.RichTextField;
  cover_image: prismic.ImageField;
};

type PostDocument = prismic.PrismicDocumentWithUID<PostDocumentData, "post">;
type CmsPageDocument = prismic.PrismicDocumentWithUID<PageDocumentData, "page">;

function mapImage(field: prismic.ImageField | null | undefined): PrismicImage | null {
  if (!field || !field.url) {
    return null;
  }
  const image = field as prismic.FilledImageFieldImage;
  return {
    url: image.url,
    alt: image.alt ?? null,
    width: image.dimensions?.width,
    height: image.dimensions?.height,
  };
}

function mapCategory(document: PostDocument): BlogCategory | null {
  const name = document.data.category ? document.data.category.trim() : "";
  if (!name) {
    return null;
  }

  return {
    name,
    slug: document.data.category_slug?.toLowerCase() ?? name.toLowerCase().replace(/\s+/g, "-"),
    color: document.data.category_color ?? null,
  };
}

function mapPost(document: PostDocument): BlogPost {
  const category = mapCategory(document);
  const coverImage = mapImage(document.data.cover_image);

  return {
    id: document.id,
    uid: document.uid ?? document.id,
    title: prismic.asText(document.data.title) || "Untitled post",
    publishedAt: document.data.date ?? document.first_publication_date ?? new Date().toISOString(),
    excerpt:
      Array.isArray(document.data.excerpt) && document.data.excerpt.length
        ? prismic.asText(document.data.excerpt)
        : null,
    category,
    coverImage,
    content: document.data.body,
  };
}

function mapPostListItem(document: PostDocument): BlogPostListItem {
  const { content: _content, ...rest } = mapPost(document);
  return rest;
}

function mapPage(document: CmsPageDocument): PageDocument {
  return {
    id: document.id,
    uid: document.uid ?? document.id,
    title: prismic.asText(document.data.title) || "Untitled page",
    content: document.data.content,
    coverImage: mapImage(document.data.cover_image),
  };
}

export async function getPosts(): Promise<BlogPostListItem[]> {
  const documents = await client.getAllByType<PostDocument>("post", {
    orderings: [{ field: "my.post.date", direction: "desc" }],
    fetchOptions: {
      next: { tags: ["prismic", "posts"], revalidate: 60 },
    },
  });

  return documents.map(mapPostListItem);
}

export async function getPostByUID(uid: string): Promise<BlogPost | null> {
  try {
    const document = await client.getByUID<PostDocument>("post", uid, {
      fetchOptions: {
        next: { tags: ["prismic", "posts", `post:${uid}`], revalidate: 60 },
      },
    });
    return mapPost(document);
  } catch (error) {
    if (error instanceof prismic.NotFoundError) {
      return null;
    }
    throw error;
  }
}

export async function getPageByUID(uid: string): Promise<PageDocument | null> {
  try {
    const document = await client.getByUID<CmsPageDocument>("page", uid, {
      fetchOptions: {
        next: { tags: ["prismic", "pages", `page:${uid}`], revalidate: 120 },
      },
    });
    return mapPage(document);
  } catch (error) {
    if (error instanceof prismic.NotFoundError) {
      return null;
    }
    throw error;
  }
}

export function getCategoryFilters(posts: BlogPostListItem[]): BlogCategory[] {
  const unique = new Map<string, BlogCategory>();

  posts.forEach((post) => {
    if (post.category) {
      unique.set(post.category.slug, post.category);
    }
  });

  return Array.from(unique.values());
}
