"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { BlogPostSummary } from "../../types/contentful";

import styles from "./HeroCarousel.module.css";

interface HeroCarouselProps {
  posts: BlogPostSummary[];
  intervalMs?: number;
}

export function HeroCarousel({ posts, intervalMs = 7000 }: HeroCarouselProps) {
  const items = useMemo(() => posts.slice(0, 5), [posts]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    // Auto-advance the carousel so featured stories get balanced exposure on load.
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.hero} aria-label="Featured posts">
      <div className={styles.gradient} aria-hidden />
      <div className={styles.slides}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const heroImage = item.coverImage?.url
            ? {
                src: `${item.coverImage.url}?w=1200&h=900&fit=fill`,
                alt: item.coverImage.description ?? item.coverImage.title ?? item.title,
              }
            : null;
          return (
            <article
              key={item.id}
              className={`${styles.slide} ${isActive ? styles.active : styles.inactive}`}
              aria-hidden={!isActive}
            >
              <div className={styles.slideInner}>
                <div className={styles.copy}>
                  <h2>
                    <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                  </h2>
                  {item.excerpt ? <p>{item.excerpt}</p> : null}
                  <Link href={`/blog/${item.slug}`} className={styles.cta}>
                    Read story
                  </Link>
                </div>
                {heroImage ? (
                  <div className={styles.media}>
                    <Image
                      src={heroImage.src}
                      alt={heroImage.alt}
                      fill
                      sizes="(min-width: 900px) 50vw, 100vw"
                      priority={index === 0}
                      className={styles.mediaImage}
                    />
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <div className={styles.dots}>
        {items.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
            aria-label={`Show slide ${index + 1}`}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
}
