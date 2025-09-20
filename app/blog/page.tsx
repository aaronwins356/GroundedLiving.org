import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "../../lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore mindful health, nutrition, and lifestyle articles from Grounded Living.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const formatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Latest Posts</h1>
        <p className="text-slate-600">
          Fresh perspectives on mindful health, seasonal rituals, nourishing recipes, and intentional living.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="flex h-full flex-col justify-between rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                <span>{post.frontmatter.category}</span>
                <time dateTime={post.frontmatter.date}>{formatter.format(new Date(post.frontmatter.date))}</time>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary-dark">
                  {post.frontmatter.title}
                </Link>
              </h2>
              <p className="text-sm text-slate-600">{post.frontmatter.description}</p>
            </div>
            <div className="mt-6">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
              >
                Read More
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
