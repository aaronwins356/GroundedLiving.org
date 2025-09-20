import type { PortableTextValue, Post } from "../types/post";

const placeholderContent: PortableTextValue = [
  {
    _key: "intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "intro-span",
        _type: "span",
        text: "Content is unavailable while running offline. This placeholder copy keeps the layout stable during local builds.",
      },
    ],
  },
];

const mockPosts: Post[] = [
  {
    _id: "mock-post-1",
    title: "Grounding Morning Ritual",
    slug: "grounding-morning",
    publishedAt: "2024-04-12T08:00:00.000Z",
    excerpt: "Begin your day with gentle stretches, focused breathing, and a nourishing breakfast to stay rooted all morning.",
    category: "Rituals",
    tags: ["mindfulness", "morning"],
    content: placeholderContent,
  },
  {
    _id: "mock-post-2",
    title: "Seasonal Reset Checklist",
    slug: "seasonal-reset",
    publishedAt: "2024-07-01T08:00:00.000Z",
    excerpt: "Refresh your routines with intention, nourishing meals, and outdoor time as the seasons shift.",
    category: "Lifestyle",
    tags: ["seasonal", "wellness"],
    content: placeholderContent,
  },
];

export interface SanityClientConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn?: boolean;
  token?: string;
  perspective?: "published" | "previewDrafts";
}

export function groq(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, part, index) => acc + part + (values[index] ?? ""), "");
}

export function createClient(_: SanityClientConfig) {
  return {
    async fetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
      if (query.includes("slug.current") && params && typeof params.slug === "string") {
        const post = mockPosts.find((entry) => entry.slug === params.slug);
        return (post ?? null) as T;
      }

      if (query.includes("[_type == \"post\"") && query.includes("order")) {
        const sorted = [...mockPosts].sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1));
        return sorted as T;
      }

      return ([] as unknown) as T;
    },
  };
}
