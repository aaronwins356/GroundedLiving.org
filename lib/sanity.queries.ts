import "server-only";

import type { PortableTextNode } from "../types/portableText";
import { fetchSanity } from "./sanity.client";
import type { SanityImageWithAlt } from "./sanity.image";

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  coverImage?: SanityImageWithAlt;
};

export type Post = PostListItem & {
  content: PortableTextNode[];
};

export type Page = {
  _id: string;
  title: string;
  slug: string;
  content: PortableTextNode[];
  coverImage?: SanityImageWithAlt;
};

const imageSelection = `
  coverImage {
    alt,
    asset {
      _ref
    }
  }
`;

const postListFields = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  category,
  ${imageSelection}
`;

const postDetailFields = `${postListFields}, content`;

export async function getPosts(): Promise<PostListItem[]> {
  const result = await fetchSanity<PostListItem[]>(
    `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { ${postListFields} }`,
    {},
    { tags: ["sanity", "posts"], revalidate: 60 },
  );
  return result ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const result = await fetchSanity<Post | null>(
    `*[_type == "post" && slug.current == $slug][0] { ${postDetailFields} }`,
    { slug },
    { tags: ["sanity", "posts", `post:${slug}`], revalidate: 60 },
  );
  return result ?? null;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const result = await fetchSanity<Page | null>(
    `*[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      content,
      ${imageSelection}
    }`,
    { slug },
    { tags: ["sanity", "pages", `page:${slug}`], revalidate: 60 },
  );
  return result ?? null;
}
