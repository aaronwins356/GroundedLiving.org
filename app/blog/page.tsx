import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "../../components/blog/PostCard";
import { getPosts } from "../../lib/sanity.queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Soulful wellness notes, nourishing recipes, and gentle rituals from Grounded Living.",
};

type BlogPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const posts = await getPosts();
  const categories = Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );

  let requestedCategory: string | undefined;
  if (searchParams?.category) {
    try {
      requestedCategory = decodeURIComponent(searchParams.category);
    } catch {
      requestedCategory = searchParams.category;
    }
  }
  const filteredPosts = requestedCategory ? posts.filter((post) => post.category === requestedCategory) : posts;

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-white/70 p-12 text-center shadow-soft-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">The Journal</p>
        <h1 className="mt-4 text-4xl font-semibold text-accent sm:text-5xl">Stories to ground and grow with you</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-accent-soft sm:text-lg">
          Slow down with mindful reflections, seasonal recipes, and wellness practices created to help you feel rooted and
          nourished.
        </p>
        {categories.length ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/blog"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                requestedCategory
                  ? "border-brand/20 bg-white/70 text-accent-soft hover:border-brand-400 hover:text-accent"
                  : "border-brand-500 bg-brand-500/10 text-accent"
              }`}
            >
              All topics
            </Link>
            {categories.map((category) => {
              const isActive = requestedCategory === category;
              const href = isActive ? "/blog" : `/blog?category=${encodeURIComponent(category)}`;
              return (
                <Link
                  key={category}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isActive
                      ? "border-brand-500 bg-brand-500/10 text-accent"
                      : "border-brand/20 bg-white/70 text-accent-soft hover:border-brand-400 hover:text-accent"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      <section>
        {filteredPosts.length ? (
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-brand/30 bg-white/60 p-12 text-center text-sm text-accent-soft">
            <p className="text-base font-semibold text-accent">No stories in this category yet</p>
            <p className="mt-2">
              Publish a post in Sanity and select the
              {requestedCategory ? (
                <>
                  {" "}
                  <span className="font-semibold text-accent">{requestedCategory}</span>{" "}
                </>
              ) : " "}
              category to fill this space.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
