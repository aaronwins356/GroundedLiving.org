#!/usr/bin/env node
/*
 * Script: migrate-posts.ts
 *
 * Reads local blog posts authored in Markdown or legacy JSX/TSX pages and
 * migrates them into Contentful as `blogPost` entries. Each entry is created
 * and immediately published so downstream builds/rendering pipelines can rely
 * on the managed content. The script is written with idempotency in mind and
 * skips posts whose slugs already exist inside Contentful.
 */

import { createClient } from "contentful-management";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import matter from "gray-matter";

const DEFAULT_LOCALE = "en-US";
const MARKDOWN_DIRECTORY = path.join(process.cwd(), "content", "posts");
const LEGACY_BLOG_DIRECTORIES = [
  path.join(process.cwd(), "pages", "blog"),
  // App Router projects occasionally stored legacy static posts directly in the
  // route folder before the Contentful migration. We inspect this directory as
  // well so nothing slips through when teams upgrade.
  path.join(process.cwd(), "app", "blog"),
];

interface Frontmatter extends Record<string, unknown> {
  title?: string;
  slug?: string;
  date?: string;
  excerpt?: string;
  description?: string;
  publishedAt?: string;
}

interface LocalPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  datePublished: string;
  sourcePath: string;
}

interface ContentfulEntryLike {
  sys: { id: string };
  fields: Record<string, Record<string, unknown>>;
  publish(): Promise<ContentfulEntryLike>;
}

interface ContentfulEnvironmentLike {
  getEntries(query: Record<string, unknown>): Promise<{ items: ContentfulEntryLike[] }>;
  createEntry(contentTypeId: string, data: { fields: Record<string, Record<string, unknown>> }): Promise<ContentfulEntryLike>;
}

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stats = await stat(dir);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function deriveExcerpt(body: string): string {
  const normalized = body
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 280);
  return normalized;
}

function normalizeDate(input: string | undefined, fallbackIso: string): string {
  if (input) {
    const date = new Date(input);
    if (!Number.isNaN(date.valueOf())) {
      return date.toISOString();
    }
  }
  return fallbackIso;
}

function buildRichTextFromMarkdown(markdown: string) {
  // We translate Markdown paragraphs into a minimal Rich Text tree so the
  // resulting entry is editable in Contentful's Rich Text editor. Editors can
  // later enhance formatting directly in the studio UI.
  const paragraphs = markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return {
    nodeType: "document",
    data: {},
    content: paragraphs.map((paragraph) => ({
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: paragraph.replace(/\n/g, " "),
          marks: [],
          data: {},
        },
      ],
    })),
  };
}

async function parseMarkdownPosts(): Promise<LocalPost[]> {
  if (!(await directoryExists(MARKDOWN_DIRECTORY))) {
    return [];
  }

  const entries = await readdir(MARKDOWN_DIRECTORY);
  const markdownFiles = entries.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

  const posts: LocalPost[] = [];

  for (const filename of markdownFiles) {
    const filePath = path.join(MARKDOWN_DIRECTORY, filename);
    const raw = await readFile(filePath, "utf8");
    const parsed = matter<Frontmatter>(raw);

    const title = parsed.data.title ?? path.parse(filename).name;
    const slug = parsed.data.slug ?? toSlug(path.parse(filename).name);
    const body = parsed.content.trim();

    if (!title || !slug || !body) {
      console.warn(`Skipping ${filename} because title, slug, or body is missing.`);
      continue;
    }

    const excerpt = parsed.data.excerpt ?? parsed.data.description ?? deriveExcerpt(body);
    const stats = await stat(filePath);
    const dateFromFile = stats.mtime.toISOString();
    const datePublished = normalizeDate(parsed.data.date ?? parsed.data.publishedAt, dateFromFile);

    posts.push({
      title,
      slug,
      content: body,
      excerpt,
      datePublished,
      sourcePath: filePath,
    });
  }

  return posts;
}

async function parseLegacyJsxPosts(): Promise<LocalPost[]> {
  const directories = [];
  for (const directory of LEGACY_BLOG_DIRECTORIES) {
    if (await directoryExists(directory)) {
      directories.push(directory);
    }
  }

  if (directories.length === 0) {
    return [];
  }

  const posts: LocalPost[] = [];

  for (const directory of directories) {
    const entries = await readdir(directory);
    const pageFiles = entries.filter((file) => file.endsWith(".tsx") || file.endsWith(".jsx"));

    for (const filename of pageFiles) {
      if (/^(index|page|layout)\.(t|j)sx$/.test(filename)) {
        // Skip framework scaffolding files so we don't accidentally migrate the
        // new Contentful-powered templates.
        continue;
      }

      const filePath = path.join(directory, filename);
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        continue;
      }

      const raw = await readFile(filePath, "utf8");

      const titleMatch = raw.match(/<h1[^>]*>(.*?)<\/h1>/s);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : path.parse(filename).name;
      const slug = toSlug(path.parse(filename).name);

      const paragraphMatches = Array.from(raw.matchAll(/<p[^>]*>(.*?)<\/p>/gms));
      const bodyBlocks = paragraphMatches.map((match) => match[1].replace(/<[^>]+>/g, "").trim());
      const body = bodyBlocks.join("\n\n");

      if (!body) {
        console.warn(`Skipping ${filename} because no <p> blocks were detected.`);
        continue;
      }

      const excerpt = deriveExcerpt(body);

      posts.push({
        title,
        slug,
        content: body,
        excerpt,
        datePublished: stats.mtime.toISOString(),
        sourcePath: filePath,
      });
    }
  }

  return posts;
}

async function fetchExistingSlugs(env: ContentfulEnvironmentLike): Promise<Set<string>> {
  const existing = await env.getEntries({ content_type: "blogPost", select: "fields.slug" });
  const slugs = new Set<string>();

  for (const entry of existing.items) {
    const slugField = entry.fields.slug?.[DEFAULT_LOCALE];
    if (typeof slugField === "string") {
      slugs.add(slugField);
    }
  }

  return slugs;
}

async function createOrUpdatePost(
  env: ContentfulEnvironmentLike,
  post: LocalPost,
  existingSlugs: Set<string>,
): Promise<void> {
  if (existingSlugs.has(post.slug)) {
    console.info(`Skipping ${post.slug} because it already exists in Contentful.`);
    return;
  }

  const entry = await env.createEntry("blogPost", {
    fields: {
      title: { [DEFAULT_LOCALE]: post.title },
      slug: { [DEFAULT_LOCALE]: post.slug },
      excerpt: { [DEFAULT_LOCALE]: post.excerpt },
      content: { [DEFAULT_LOCALE]: buildRichTextFromMarkdown(post.content) },
      datePublished: { [DEFAULT_LOCALE]: post.datePublished },
    },
  });

  await entry.publish();
  console.info(`Published Contentful blogPost → slug: ${post.slug}`);
}

async function migrate() {
  const spaceId = assertEnv("CONTENTFUL_SPACE_ID");
  const managementToken = assertEnv("CONTENTFUL_MANAGEMENT_TOKEN");
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

  const [markdownPosts, legacyPosts] = await Promise.all([parseMarkdownPosts(), parseLegacyJsxPosts()]);
  const posts = [...markdownPosts, ...legacyPosts];

  if (posts.length === 0) {
    console.info("No local posts detected. Nothing to migrate.");
    return;
  }

  console.info(`Detected ${posts.length} local posts. Beginning migration to Contentful...`);

  const client = createClient({ accessToken: managementToken });
  const space = await client.getSpace(spaceId);
  const environment = (await space.getEnvironment(environmentId)) as ContentfulEnvironmentLike;

  const existingSlugs = await fetchExistingSlugs(environment);

  for (const post of posts) {
    try {
      await createOrUpdatePost(environment, post, existingSlugs);
    } catch (error) {
      console.error(`Failed to publish ${post.slug} from ${post.sourcePath}`, error);
    }
  }

  console.info("Migration complete.");
}

migrate().catch((error) => {
  console.error("Unexpected migration failure", error);
  process.exitCode = 1;
});
