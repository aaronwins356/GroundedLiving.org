export interface StudioAuthor {
  id: string;
  name: string;
  bio: string;
}

export interface StudioPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorId?: string;
  authorName?: string;
  status: "published" | "draft";
  updatedAt: string;
}

export interface StudioAsset {
  id: string;
  title: string;
  file: string;
  updatedAt: string;
}

export interface MutationResult<T> {
  data?: T;
  error?: string;
}
