import Image from "next/image";
import Link from "next/link";

import { FeaturedCarousel } from "../components/blog/FeaturedCarousel";
import { PostCard } from "../components/blog/PostCard";
import { PortableTextRenderer } from "../components/rich-text/PortableTextRenderer";
import { getPageBySlug, getPosts } from "../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../lib/sanity.image";

export default async function HomePage() {
  const [posts, aboutPage] = await Promise.all([getPosts(), getPageBySlug("about")]);

  const heroSlides = posts.slice(0, 3).map((post) => ({
    ...post,
    imageUrl: hasSanityImageAsset(post.coverImage)
      ? urlForImage(post.coverImage).width(1200).height(800).fit("crop").auto("format").url()
      : null,
  }));
  const recentPosts = posts.slice(0, 6);
  const categories = Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );
  const aboutSnippet = aboutPage?.content?.slice(0, 2) ?? [];

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white/75 shadow-soft-lg ring-1 ring-brand-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(107,144,128,0.2),_transparent_55%)]" aria-hidden />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-center gap-6 p-10 sm:p-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-300 bg-brand-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-brand-700">
              Featured rituals
            </span>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-accent sm:text-5xl lg:text-6xl">
              A soft place to land for mindful, modern living.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-accent-soft sm:text-lg">
              Pour a warm mug, open your heart, and explore weekly reflections, seasonal nourishment, and grounded routines that keep life beautifully simple.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand-700"
              >
                Explore the journal
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-brand-300/70 bg-white px-6 py-3 text-sm font-semibold text-accent transition hover:border-brand-500"
              >
                Meet the creator
              </Link>
            </div>
            <div className="rounded-3xl border border-dashed border-brand-200/70 bg-brand-50/50 p-6 text-xs text-accent-soft">
              <p className="font-semibold uppercase tracking-[0.4em] text-brand-500">Partner spotlight</p>
              <p className="mt-2 leading-relaxed">
                Future affiliate rituals and soulful sponsors will nestle here—keeping collaborations visible without crowding the stories.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 p-6 sm:p-10">
            <div className="flex-1">
              <FeaturedCarousel posts={heroSlides} />
            </div>
            <div className="hidden rounded-3xl border border-brand-100 bg-white/80 p-6 text-sm text-accent-soft shadow-soft-lg lg:block">
              <p className="font-semibold text-accent">Keep the carousel fresh</p>
              <p className="mt-2 leading-relaxed">
                Publish a story in Sanity and the freshest entries will cycle here automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Browse by intention</p>
            <h2 className="font-serif text-3xl font-semibold text-accent">Categories to explore</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-brand-700 transition hover:text-brand-800">
            View all posts →
          </Link>
        </div>
        {categories.length ? (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-accent-soft transition hover:-translate-y-0.5 hover:border-brand-400 hover:text-accent"
              >
                <span className="h-2 w-2 rounded-full bg-brand-400 transition group-hover:bg-brand-500" aria-hidden />
                <span>{category}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-[2rem] border border-dashed border-brand-200 bg-white/70 p-8 text-sm text-accent-soft">
            Add categories to your Sanity posts to help readers discover topics quickly.
          </p>
        )}
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Fresh on the journal</p>
            <h2 className="font-serif text-3xl font-semibold text-accent">Recent stories</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-brand-700 transition hover:text-brand-800">
            View archive →
          </Link>
        </div>
        {recentPosts.length ? (
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="rounded-[2rem] border border-dashed border-brand-200 bg-white/70 p-10 text-center text-sm text-accent-soft">
            Add your first post in Sanity to see it featured here.
          </p>
        )}
      </section>

      <section className="grid gap-10 rounded-[2.5rem] bg-white/80 p-10 shadow-soft-lg ring-1 ring-brand-100 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">About</p>
          <h2 className="font-serif text-3xl font-semibold text-accent">Hi, I&rsquo;m glad you&rsquo;re here.</h2>
          {aboutSnippet.length ? (
            <div className="prose prose-brand max-w-none text-accent-soft">
              <PortableTextRenderer value={aboutSnippet} />
            </div>
          ) : (
            <p className="max-w-xl text-base leading-relaxed text-accent-soft">
              Create an “About” page inside Sanity to introduce yourself and welcome new readers. A short bio will show up here automatically.
            </p>
          )}
          <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800">
            Read the full story
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-100 via-white to-brand-200">
          {aboutPage?.coverImage && hasSanityImageAsset(aboutPage.coverImage) ? (
            <Image
              src={urlForImage(aboutPage.coverImage).width(1200).height(900).fit("crop").auto("format").url()}
              alt={aboutPage.coverImage.alt ?? "Grounded Living founder"}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
