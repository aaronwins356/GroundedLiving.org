import "server-only";

import { getAllPosts } from "../data/posts";
import type { Post, PostSummary, SanityImageAsset } from "../types/post";

export type SanityImage = SanityImageAsset;

export type PostListItem = Pick<PostSummary, "title" | "slug" | "publishedAt" | "coverImage" | "excerpt">;

export async function getPosts(): Promise<PostListItem[]> {
  const posts = getAllPosts()
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return posts.map(({ title, slug, publishedAt, coverImage, excerpt }) => ({
    title,
    slug,
    publishedAt,
    coverImage,
    excerpt,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = getAllPosts();
  const match = posts.find((post) => post.slug === slug);
  return match ?? null;
}
