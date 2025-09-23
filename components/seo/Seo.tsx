"use client";

import { NextSeo } from "next-seo";

export type SeoProps = {
  title: string;
  description?: string | null;
  canonical?: string;
  openGraph?: {
    url?: string;
    images?: { url: string; alt?: string | null }[];
    type?: "website" | "article";
    publishedTime?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
  };
};

export function Seo({ title, description, canonical, openGraph, twitter }: SeoProps) {
  return (
    <NextSeo
      title={title}
      description={description ?? undefined}
      canonical={canonical}
      openGraph={{
        title,
        description: description ?? undefined,
        url: openGraph?.url,
        type: openGraph?.type ?? "article",
        article: openGraph?.publishedTime ? { publishedTime: openGraph.publishedTime } : undefined,
        images: openGraph?.images,
      }}
      twitter={{
        cardType: "summary_large_image",
        title: twitter?.title ?? title,
        description: twitter?.description ?? description ?? undefined,
        image: twitter?.image,
      }}
    />
  );
}
