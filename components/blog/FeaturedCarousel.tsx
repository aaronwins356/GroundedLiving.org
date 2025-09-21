"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { PostListItem } from "../../lib/sanity.queries";

// Rotate highlighted stories every eight seconds to mimic the calm cadence of the brand.
const AUTO_ROTATE_INTERVAL = 8000;

type FeaturedCarouselPost = PostListItem & {
  imageUrl: string | null;
};

type FeaturedCarouselProps = {
  posts: FeaturedCarouselPost[];
};

export function FeaturedCarousel({ posts }: FeaturedCarouselProps) {
  const slides = useMemo(() => posts.slice(0, 5), [posts]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-brand/30 bg-white/60 p-8 text-center text-sm text-accent-soft">
        Publish a post in Sanity to feature it here.
      </div>
    );
  }

  const activePost = slides[index];
  const imageUrl = activePost.imageUrl;

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-3xl bg-white shadow-soft-lg">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={activePost.coverImage?.alt ?? activePost.title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-white to-brand-200" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.3em]">
          {activePost.category ? (
            <Link
              href={`/blog?category=${encodeURIComponent(activePost.category)}`}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-white transition hover:bg-white/30"
            >
              {activePost.category}
            </Link>
          ) : (
            <span>Mindful Living</span>
          )}
          <span className="text-white/60">•</span>
          <time dateTime={activePost.publishedAt}>
            {new Date(activePost.publishedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
            <Link href={`/blog/${activePost.slug}`} className="transition hover:text-brand-200">
              {activePost.title}
            </Link>
          </h2>
          {activePost.excerpt ? (
            <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {activePost.excerpt}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
          <div className="flex items-center gap-1">
            {slides.map((post, slideIndex) => (
              <button
                key={post._id}
                type="button"
                className={`h-2 w-6 rounded-full transition ${
                  slideIndex === index ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`View slide ${slideIndex + 1}`}
                onClick={() => setIndex(slideIndex)}
              />
            ))}
          </div>
          <Link
            href={`/blog/${activePost.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:text-brand-100"
          >
            Read more
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
