import fs from "node:fs/promises";
import path from "node:path";

import type {
  PortableTextBlock,
  PortableTextSpan,
  PortableTextValue,
  Post,
  PostSummary,
} from "../types/post";

type SanityConfig = {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn?: boolean;
};

type FetchParams = Record<string, unknown> | undefined;

type SanityClient = {
  fetch<T>(query: string, params?: FetchParams): Promise<T>;
};

let cachedPosts: Post[] | null = null;

export function createClient(_config: SanityConfig): SanityClient {
  return {
    async fetch<T>(query: string, params?: FetchParams) {
      const posts = await loadPosts();

      if (query.includes("slug.current == $slug")) {
        const slugParam = typeof params?.slug === "string" ? params.slug : "";
        const match = posts.find((post) => post.slug === slugParam) ?? null;
        return match as T;
      }

      if (query.includes("content[]{")) {
        return posts as unknown as T;
      }

      const summaries = posts.map<PostSummary>(({ content, ...summary }) => summary);
      return summaries as unknown as T;
    },
  };
}

export function groq(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = "";
  strings.forEach((segment, index) => {
    result += segment;
    if (index < values.length) {
      result += String(values[index] ?? "");
    }
  });
  return result;
}

async function loadPosts(): Promise<Post[]> {
  if (cachedPosts) {
    return cachedPosts;
  }

  const postsDirectory = path.join(process.cwd(), "content", "posts");
  const entries = await fs.readdir(postsDirectory);
  const posts: Post[] = [];

  for (const entry of entries) {
    if (!/\.mdx?$/.test(entry)) {
      continue;
    }

    const slug = entry.replace(/\.mdx?$/, "");
    const filePath = path.join(postsDirectory, entry);
    const rawContent = await fs.readFile(filePath, "utf8");
    const { frontMatter, body } = parseFrontMatter(rawContent);

    if (!frontMatter.title || !frontMatter.date) {
      continue;
    }

    const publishedAt = new Date(frontMatter.date).toISOString();
    const content = markdownToPortableText(body, slug);

    posts.push({
      _id: slug,
      title: frontMatter.title,
      slug,
      publishedAt,
      excerpt: frontMatter.description ?? undefined,
      category: frontMatter.category ?? undefined,
      tags: frontMatter.tags ?? undefined,
      coverImage: undefined,
      content,
    });
  }

  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  cachedPosts = posts;
  return posts;
}

type FrontMatter = {
  title?: string;
  date?: string;
  category?: string;
  tags?: string[];
  description?: string;
};

function parseFrontMatter(source: string): { frontMatter: FrontMatter; body: string } {
  if (!source.startsWith("---")) {
    return { frontMatter: {}, body: source };
  }

  const closing = source.indexOf("\n---", 3);
  if (closing === -1) {
    return { frontMatter: {}, body: source };
  }

  const frontMatterSection = source.slice(3, closing).trim();
  const body = source.slice(closing + 4).trim();
  const lines = frontMatterSection.split(/\r?\n/);
  const data: FrontMatter = {};
  let currentArrayKey: keyof FrontMatter | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      if (!currentArrayKey) {
        continue;
      }
      const value = trimmed.replace(/^-\s+/, "");
      const arrayValue = (data[currentArrayKey] as string[] | undefined) ?? [];
      arrayValue.push(stripQuotes(value));
      data[currentArrayKey] = arrayValue as never;
      continue;
    }

    const [keyPart, ...rest] = trimmed.split(":");
    const key = keyPart.trim() as keyof FrontMatter;
    const remainder = rest.join(":").trim();

    if (!remainder) {
      data[key] = [] as never;
      currentArrayKey = key;
      continue;
    }

    data[key] = stripQuotes(remainder) as never;
    currentArrayKey = null;
  }

  return { frontMatter: data, body };
}

function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

function markdownToPortableText(markdown: string, slug: string): PortableTextValue {
  const lines = markdown.split(/\r?\n/);
  const blocks: PortableTextBlock[] = [];
  let paragraphBuffer: string[] = [];
  let counter = 0;

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }
    const text = normalizeInlineFormatting(paragraphBuffer.join(" "));
    blocks.push(createBlock(text, slug, counter++, "normal"));
    paragraphBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      const text = normalizeInlineFormatting(trimmed.slice(4).trim());
      blocks.push(createBlock(text, slug, counter++, "h3"));
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      const text = normalizeInlineFormatting(trimmed.slice(3).trim());
      blocks.push(createBlock(text, slug, counter++, "h2"));
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      const text = normalizeInlineFormatting(trimmed.slice(2).trim());
      blocks.push(createBlock(text, slug, counter++, "h1"));
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();

  if (!blocks.length) {
    blocks.push(createBlock("", slug, counter++, "normal"));
  }

  return blocks;
}

function normalizeInlineFormatting(value: string): string {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
}

function createBlock(
  text: string,
  slug: string,
  counter: number,
  style: PortableTextBlock["style"],
): PortableTextBlock {
  const span: PortableTextSpan = {
    _key: `${slug}-span-${counter}`,
    _type: "span",
    text,
  };

  return {
    _key: `${slug}-block-${counter}`,
    _type: "block",
    style,
    children: [span],
    markDefs: [],
  };
}
