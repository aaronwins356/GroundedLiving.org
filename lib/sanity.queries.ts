import "server-only";

import { groq } from "next-sanity";
import type { PortableTextBlock } from "sanity";

import { sanityClient } from "./sanity.client";

type SanityImageReference = {
  _type: "reference";
  _ref: string;
};

export type SanityImage = {
  _type: "image";
  asset: SanityImageReference;
};

export interface PostListItem {
  title: string;
  slug: string;
  publishedAt: string;
  coverImage?: SanityImage;
  excerpt?: string;
}

export interface Post extends PostListItem {
  content: PortableTextBlock[];
}

const postFields = `
  title,
  "slug": slug.current,
  publishedAt,
  coverImage{
    _type,
    asset
  },
  content
`;

export async function getPosts(): Promise<PostListItem[]> {
  return sanityClient.fetch<PostListItem[]>(
    groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
      title,
      "slug": slug.current,
      publishedAt,
      coverImage{
        _type,
        asset
      },
      "excerpt": coalesce(pt::text(content[0]), "")
    }`,
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return sanityClient.fetch<Post | null>(
    groq`*[_type == "post" && slug.current == $slug][0]{${postFields}}`,
    { slug },
  );
}
