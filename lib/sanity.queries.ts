import "server-only";

import { groq } from "next-sanity";

import type { Post, PostSummary } from "../types/post";
import { sanityClient } from "./sanity.client";

const POST_SUMMARY_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  category,
  tags,
  coverImage{
    _type,
    alt,
    asset
  }
`;

const POST_DETAIL_PROJECTION = `
  ${POST_SUMMARY_PROJECTION},
  content[]{
    ...,
    asset
  }
`;

export async function getPosts(): Promise<PostSummary[]> {
  return sanityClient.fetch<PostSummary[]>(
    groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc){${POST_SUMMARY_PROJECTION}}`,
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return sanityClient.fetch<Post | null>(
    groq`*[_type == "post" && slug.current == $slug][0]{${POST_DETAIL_PROJECTION}}`,
    { slug },
  );
}
