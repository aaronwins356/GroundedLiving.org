import type { ReactNode } from "react";

/**
 * Minimal Contentful Rich Text node definitions used by our custom renderer.
 * We recreate the types locally because the official packages are not available
 * inside this sandboxed environment.
 */
export interface RichTextMark {
  type: "bold" | "italic" | "underline" | "code";
}

export interface RichTextNode {
  nodeType:
    | "document"
    | "paragraph"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "heading-5"
    | "heading-6"
    | "blockquote"
    | "hyperlink"
    | "ordered-list"
    | "unordered-list"
    | "list-item"
    | "embedded-asset-block"
    | "hr"
    | "text";
  value?: string;
  marks?: RichTextMark[];
  data?: Record<string, unknown>;
  content?: RichTextNode[];
}

export interface RichTextDocument extends RichTextNode {
  nodeType: "document";
  content: RichTextNode[];
  data?: Record<string, unknown>;
}

export interface ContentfulImageAsset {
  url: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

export interface ContentfulCategory {
  name: string;
  slug: string;
  description?: string;
}

export interface ContentfulPage {
  id: string;
  title: string;
  slug: string;
  content: RichTextDocument | null;
  navigationLabel?: string | null;
  navigationPriority?: number | null;
  heroImage?: ContentfulImageAsset | null;
}

export interface BlogPostAuthor {
  name: string;
  bio?: string | null;
  avatarImage?: ContentfulImageAsset | null;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: ContentfulImageAsset | null;
  datePublished?: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: RichTextDocument | null;
  author?: BlogPostAuthor | null;
  seoDescription?: string | null;
  affiliate?: boolean;
  affiliateCtaText?: string | null;
  affiliateCtaUrl?: string | null;
  sponsored?: boolean;
  sponsoredLabel?: string | null;
  disclosureNeeded?: boolean;
  disableAutoLinks?: boolean;
}

/**
 * Backwards compatible alias for legacy imports.
 */
export type ContentfulBlogPost = BlogPost;

export interface ContentfulCollection<T> {
  items: T[];
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export type RichTextRenderer = (document: RichTextDocument | null) => ReactNode;
