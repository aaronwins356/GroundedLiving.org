import "server-only";

import type { PortableTextBlock } from "sanity";

import { getSanityClient } from "./sanity.client";
import type { SanityImageWithAlt } from "./sanity.image";

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  coverImage?: SanityImageWithAlt;
};

export type Post = PostListItem & {
  content: PortableTextBlock[];
};

const postListFields = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  coverImage
`;

const postDetailFields = `${postListFields}, content`;

export async function getPosts(): Promise<PostListItem[]> {
  const client = getSanityClient();
  if (!client) {
    return [];
  }

  return client.fetch<PostListItem[]>(
    `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { ${postListFields} }`,
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const client = getSanityClient();
  if (!client) {
    return null;
  }

  return client.fetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0] { ${postDetailFields} }`,
    { slug },
  );
}
