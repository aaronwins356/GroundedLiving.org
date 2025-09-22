import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PostFeed } from "../../components/blog/PostFeed";
import { getCategoryFilters, getPosts } from "../../lib/prismic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Soulful wellness notes, nourishing recipes, and gentle rituals from Grounded Living.",
};

type BlogSearchParams = Record<string, string | string[] | undefined>;

type BlogPageProps = {
  searchParams?: Promise<BlogSearchParams>;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const posts = await getPosts();
  const categories = getCategoryFilters(posts);
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const rawCategory = resolvedSearchParams.category;
  const requestedCategory = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  let normalizedCategory: string | undefined;
  if (requestedCategory) {
    try {
      normalizedCategory = decodeURIComponent(requestedCategory);
    } catch {
      normalizedCategory = requestedCategory;
    }
  }
  const filteredPosts = normalizedCategory
    ? posts.filter(
        (post) =>
          post.category?.slug === normalizedCategory ||
          post.category?.name.toLowerCase() === normalizedCategory.toLowerCase(),
      )
    : posts;

  const [featuredPost] = filteredPosts;

  return (
    <div className="space-y-20 text-emerald-950">
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-rose-100 via-cream to-emerald-100/60 px-8 py-16 shadow-[0_60px_140px_rgba(150,170,160,0.18)]">
        <div className="absolute -right-32 -top-32 hidden h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl lg:block" aria-hidden />
        <div className="absolute -bottom-40 -left-20 hidden h-80 w-80 rounded-full bg-rose-200/30 blur-3xl lg:block" aria-hidden />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              The journal
            </span>
            <h1 className="font-serif text-4xl leading-tight tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
              Healing Soulfully with Grounded Living
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-emerald-900/70">
              Slow down with mindful reflections, seasonal recipes, and gentle wellness rituals made for a softer, more rooted life.
            </p>
            {featuredPost ? (
              <div className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-inner shadow-emerald-100/40 ring-1 ring-emerald-100/70">
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-800/80">
                  {featuredPost.category ? (
                    <Link
                      href={`/blog?category=${encodeURIComponent(featuredPost.category.slug)}`}
                      className="rounded-full bg-emerald-50/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-700"
                    >
                      {featuredPost.category.name}
                    </Link>
                  ) : null}
                  <time dateTime={featuredPost.publishedAt}>
                    {dateFormatter.format(new Date(featuredPost.publishedAt))}
                  </time>
                </div>
                <h2 className="font-serif text-3xl leading-snug text-emerald-950">
                  <Link href={`/blog/${featuredPost.uid}`} className="transition hover:text-emerald-600">
                    {featuredPost.title}
                  </Link>
                </h2>
                {featuredPost.excerpt ? (
                  <p className="text-base leading-relaxed text-slate-600">
                    {featuredPost.excerpt}
                  </p>
                ) : null}
                <Link
                  href={`/blog/${featuredPost.uid}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700 transition hover:text-emerald-500"
                >
                  Read the feature
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ) : (
              <p className="rounded-3xl bg-white/70 p-6 text-sm text-emerald-800/80 ring-1 ring-emerald-100">
                Publish your first Prismic post to introduce your readers to the journal. Featured stories will appear here automatically.
              </p>
            )}
          </div>
          <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-white/40 shadow-[0_40px_100px_rgba(160,180,170,0.22)] ring-1 ring-emerald-100/70 lg:block">
            {featuredPost?.coverImage?.url ? (
              <Image
                src={featuredPost.coverImage.url}
                alt={featuredPost.coverImage.alt ?? featuredPost.title}
                fill
                sizes="(min-width: 1280px) 540px, 50vw"
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-emerald-100 via-white to-rose-100" />
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        {categories.length ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className={`rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition ${
                normalizedCategory
                  ? "border-transparent bg-white/60 text-emerald-500 hover:bg-white"
                  : "border-emerald-200 bg-emerald-50/70 text-emerald-700"
              }`}
            >
              All topics
            </Link>
            {categories.map((category) => {
              const isActive =
                normalizedCategory === category.slug ||
                normalizedCategory === category.name ||
                normalizedCategory === category.name.toLowerCase();
              return (
                <Link
                  key={category.slug}
                  href={isActive ? "/blog" : `/blog?category=${encodeURIComponent(category.slug)}`}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-transparent bg-white/60 text-emerald-500 hover:border-emerald-200 hover:bg-white"
                  }`}
                  style={
                    category.color
                      ? {
                          color: isActive ? category.color : undefined,
                          borderColor: isActive ? `${category.color}80` : undefined,
                        }
                      : undefined
                  }
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        ) : null}

        {filteredPosts.length ? (
          <PostFeed posts={filteredPosts} />
        ) : (
          <div className="rounded-[2.5rem] bg-white/80 p-12 text-center shadow-[0_40px_120px_rgba(170,190,180,0.18)] ring-1 ring-emerald-100/70">
            <p className="text-lg text-emerald-800/80">
              No stories have been published in this category yet. Open Prismic, create a post, and watch this space bloom.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
