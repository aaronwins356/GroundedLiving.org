"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPostSummary } from "@/lib/contentful";
import { getPlaceholderImage } from "@/lib/contentful";

const AUTO_ROTATE_INTERVAL = 7000;

type Props = {
  posts: BlogPostSummary[];
};

export function HeroCarousel({ posts }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visiblePosts = posts.slice(0, 3);

  useEffect(() => {
    if (visiblePosts.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visiblePosts.length);
    }, AUTO_ROTATE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [visiblePosts.length]);

  if (visiblePosts.length === 0) {
    return null;
  }

  const activePost = visiblePosts[activeIndex];
  const image = activePost.coverImage ?? getPlaceholderImage();

  return (
    <section className="hero-background relative overflow-hidden">
      <div className="absolute left-8 top-8 hidden max-w-sm rounded-3xl border border-white/40 bg-white/70 px-6 py-4 text-sm text-[#3b443b] shadow-[0_18px_40px_rgba(169,146,128,0.25)] sm:block">
        <p className="font-heading text-sm uppercase tracking-[0.5em] text-sage-500">Gather & Glow</p>
        <p className="mt-2 text-base leading-relaxed text-[#4c544c]">
          Nourish your rituals with tender stories, seasonal recipes, and mindful practices from the Grounded Living journal.
        </p>
      </div>
      <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative min-h-[420px] overflow-hidden rounded-[36px]">
          <Image
            src={image.url}
            alt={image.alt ?? activePost.title}
            fill
            priority
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out will-change-transform"
            placeholder={image.url.startsWith("data:") ? "blur" : undefined}
            blurDataURL={image.url.startsWith("data:") ? image.url : undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f]/50 via-[#1f1f1f]/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.4em]">
              <span className="rounded-full bg-white/20 px-3 py-1">Featured</span>
              {activePost.category ? (
                <span className="rounded-full bg-white/20 px-3 py-1">{activePost.category.name}</span>
              ) : null}
            </div>
            <h1 className="mt-6 max-w-3xl font-heading text-4xl sm:text-5xl md:text-6xl">
              <Link href={`/blog/${activePost.slug}`}>{activePost.title}</Link>
            </h1>
            {activePost.excerpt ? <p className="mt-4 max-w-2xl text-base text-white/85">{activePost.excerpt}</p> : null}
            <Link
              href={`/blog/${activePost.slug}`}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-[#3b443b] shadow-lg transition hover:bg-white"
            >
              Read the story
            </Link>
          </div>
        </div>
        <div className="relative space-y-4 px-4 py-6 lg:px-6">
          <div className="space-y-4">
            {visiblePosts.map((post, index) => {
              const thumb = post.coverImage ?? getPlaceholderImage();
              const isActive = index === activeIndex;
              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    "group flex w-full items-center gap-4 rounded-3xl border border-cream-200/70 bg-white/70 p-3 text-left shadow-sm transition-all duration-300",
                    isActive ? "shadow-[0_20px_45px_rgba(108,159,136,0.2)]" : "hover:-translate-y-0.5 hover:shadow-md",
                  )}
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                    <Image
                      src={thumb.url}
                      alt={thumb.alt ?? post.title}
                      fill
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      placeholder={thumb.url.startsWith("data:") ? "blur" : undefined}
                      blurDataURL={thumb.url.startsWith("data:") ? thumb.url : undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.35em] text-sage-500">{post.category?.name ?? "Journal"}</p>
                    <p className="mt-2 font-heading text-lg text-[#3b443b]">{post.title}</p>
                    <p className="text-xs text-[#4c544c]">{new Date(post.datePublished).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <span className={clsx("h-3 w-3 rounded-full", isActive ? "bg-sage-500" : "bg-cream-200 group-hover:bg-sage-400")} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
