import type { Metadata } from "next";

import { PostCard } from "../../components/blog/PostCard";
import { getPosts } from "../../lib/sanity.queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Soulful wellness notes, nourishing recipes, and gentle rituals from Grounded Living.",
};

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-white/70 p-12 text-center shadow-soft-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">The Journal</p>
        <h1 className="mt-4 text-4xl font-semibold text-accent sm:text-5xl">Stories to ground and grow with you</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-accent-soft sm:text-lg">
          Slow down with mindful reflections, seasonal recipes, and wellness practices created to help you feel rooted and
          nourished.
        </p>
      </section>

      <section>
        {posts.length ? (
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-brand/30 bg-white/60 p-12 text-center text-sm text-accent-soft">
            No posts yet. Publish your first article in Sanity to see it here.
          </p>
        )}
      </section>
    </div>
  );
}
