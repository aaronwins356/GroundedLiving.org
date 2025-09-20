import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export type PostFrontmatter = {
  title: string;
  date: string;
  category?: string;
  tags?: string[];
  description?: string;
  image?: string;
};

export type Post = {
  slug: string;
  content: string;
  frontmatter: PostFrontmatter;
};

export async function getPostSlugs(): Promise<string[]> {
  const files = await fs.readdir(postsDirectory);
  return files.filter((file) => file.endsWith(".md"));
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const { name: realSlug } = path.parse(slug);
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug: realSlug,
    content: contentHtml,
    frontmatter: {
      title: data.title ?? realSlug,
      date: data.date ?? new Date().toISOString(),
      category: data.category ?? "",
      tags: data.tags ?? [],
      description: data.description ?? "",
      image: data.image ?? "",
    },
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  return posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}
