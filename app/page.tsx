import Image from "next/image";
import Link from "next/link";
import { PrismicRichText } from "../components/prismic/RichText";

import { PostCard } from "../components/blog/PostCard";
import { getBlogPosts, getCategoryFilters } from "../lib/contentful";
import { getPageByUID } from "../lib/prismic";

export default async function HomePage() {
  const [posts, aboutPage] = await Promise.all([getBlogPosts(), getPageByUID("about")]);
  const categories = getCategoryFilters(posts);
  const featured = posts[0];
  const recentPosts = posts.slice(0, 6);

  return (
    <div className="space-y-24 text-emerald-950">
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-100 via-white to-rose-100 px-8 py-16 shadow-[0_60px_160px_rgba(150,170,160,0.2)] ring-1 ring-emerald-100/70">
        <div className="absolute -right-32 top-24 hidden h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl md:block" aria-hidden />
        <div className="absolute -left-20 -bottom-20 hidden h-80 w-80 rounded-full bg-rose-200/40 blur-3xl md:block" aria-hidden />
        <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              Grounded Living
            </span>
            <h1 className="font-serif text-4xl leading-tight tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
              A soft sanctuary for mindful rituals and soulful nourishment
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-emerald-900/70">
              Pour a warm mug, breathe deep, and explore weekly reflections, nurturing recipes, and grounded rituals to help you feel beautifully rooted.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-50 shadow-lg shadow-emerald-200/50 transition hover:bg-emerald-500"
              >
                Explore the journal
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-emerald-300/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700 transition hover:border-emerald-400 hover:bg-white"
              >
                Meet the guide
              </Link>
            </div>
            {featured ? (
              <div className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-inner shadow-emerald-100/50 ring-1 ring-emerald-100/70">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
                  Featured story
                </span>
                <h2 className="font-serif text-3xl leading-snug text-emerald-950">
                  <Link href={`/blog/${featured.slug}`} className="transition hover:text-emerald-600">
                    {featured.title}
                  </Link>
                </h2>
                {featured.excerpt ? (
                  <p className="text-base leading-relaxed text-slate-600">{featured.excerpt}</p>
                ) : null}
                <Link
                  href={`/blog/${featured.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700 transition hover:text-emerald-500"
                >
                  Read the feature
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ) : null}
          </div>
          <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-white/50 shadow-[0_50px_140px_rgba(150,170,160,0.24)] ring-1 ring-emerald-100/70 lg:block">
            {featured?.coverImage?.url ? (
              <Image
                src={featured.coverImage.url}
                alt={featured.coverImage.alt ?? featured.title}
                fill
                sizes="(min-width: 1280px) 520px, 45vw"
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-emerald-50 via-white to-rose-100" />
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Browse by intention</span>
            <h2 className="font-serif text-3xl tracking-tight text-emerald-950">Categories to explore</h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 transition hover:text-emerald-500"
          >
            View all posts
          </Link>
        </div>
        {categories.length ? (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog?category=${encodeURIComponent(category.slug)}`}
                className="rounded-full border border-emerald-200/80 bg-white/70 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:border-emerald-300 hover:bg-white"
                style={category.color ? { color: category.color } : undefined}
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-white/80 p-6 text-sm text-emerald-800/80 ring-1 ring-emerald-100">
            Add categories to your Contentful entries to help readers discover topics quickly.
          </p>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Fresh on the journal</span>
            <h2 className="font-serif text-3xl tracking-tight text-emerald-950">Recent stories</h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 transition hover:text-emerald-500"
          >
            View archive
          </Link>
        </div>
        {recentPosts.length ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] bg-white/80 p-12 text-center text-lg text-emerald-800/80 shadow-[0_40px_120px_rgba(160,180,170,0.18)] ring-1 ring-emerald-100/70">
            Publish your first Contentful post to see it highlighted here.
          </div>
        )}
      </section>

      <section className="grid gap-12 rounded-[3rem] bg-gradient-to-br from-emerald-50 via-white to-rose-100 p-12 shadow-[0_50px_140px_rgba(150,170,160,0.2)] ring-1 ring-emerald-100/70 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">About</span>
          <h2 className="font-serif text-3xl tracking-tight text-emerald-950">Hi, I&apos;m glad you&apos;re here.</h2>
          {aboutPage ? (
            <div className="space-y-4 text-base leading-relaxed text-slate-700">
              <PrismicRichText field={aboutPage.content?.slice(0, 3) ?? null} />
            </div>
          ) : (
            <p className="text-base leading-relaxed text-slate-700">
              Create an About page in Prismic to introduce yourself and welcome new readers.
            </p>
          )}
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700 transition hover:text-emerald-500"
          >
            Read the full story
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="relative h-80 overflow-hidden rounded-[2.5rem] bg-white/60 shadow-[0_40px_120px_rgba(160,180,170,0.2)] ring-1 ring-emerald-100/70">
          {aboutPage?.coverImage?.url ? (
            <Image
              src={aboutPage.coverImage.url}
              alt={aboutPage.coverImage.alt ?? aboutPage.title}
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-rose-100 via-white to-emerald-100" />
          )}
        </div>
      </section>
    </div>
  );
}
