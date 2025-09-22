"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { PostListItem } from "../../lib/sanity.queries";
import styles from "./FeaturedCarousel.module.css";

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
    return <div className={styles.empty}>Publish a post in Sanity to feature it here.</div>;
  }

  const activePost = slides[index];
  const imageUrl = activePost.imageUrl;
  const formattedDate = new Date(activePost.publishedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.carousel}>
      <div className={styles.slideImage}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={activePost.coverImage?.alt ?? activePost.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        ) : null}
      </div>
      <div className={styles.overlay} aria-hidden />
      <div className={styles.content}>
        <div className={styles.meta}>
          {activePost.category ? (
            <Link href={`/blog?category=${encodeURIComponent(activePost.category.slug)}`} className={styles.category}>
              {activePost.category.title}
            </Link>
          ) : (
            <span className={styles.category}>Mindful Living</span>
          )}
          <span>•</span>
          <time dateTime={activePost.publishedAt}>{formattedDate}</time>
        </div>
        <div>
          <h2 className={styles.title}>
            <Link href={`/blog/${activePost.slug}`}>{activePost.title}</Link>
          </h2>
          {activePost.excerpt ? <p className={styles.excerpt}>{activePost.excerpt}</p> : null}
        </div>
        <div className={styles.footer}>
          <div className={styles.dots}>
            {slides.map((post, slideIndex) => (
              <button
                key={post._id}
                type="button"
                className={`${styles.dot} ${slideIndex === index ? styles.dotActive : ""}`}
                aria-label={`View slide ${slideIndex + 1}`}
                onClick={() => setIndex(slideIndex)}
              />
            ))}
          </div>
          <Link href={`/blog/${activePost.slug}`} className={styles.readMore}>
            Read more <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
