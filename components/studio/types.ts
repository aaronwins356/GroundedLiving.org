import type { RichTextDocument } from "@project-types/contentful";

export interface StudioAsset {
  id: string;
  url?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface StudioPostSummary {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  datePublished?: string | null;
  seoDescription?: string | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface StudioPostDetail extends StudioPostSummary {
  content: RichTextDocument | null;
  authorId?: string | null;
  coverImage?: StudioAsset | null;
}

export interface MutationResult<T> {
  data?: T;
  error?: string;
}
