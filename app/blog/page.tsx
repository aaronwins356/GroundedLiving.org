import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { PostFeed } from "../../components/blog/PostFeed";
import { getPosts } from "../../lib/sanity.queries";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Soulful wellness notes, nourishing recipes, and gentle rituals from Grounded Living.",
};

type BlogSearchParams = Record<string, string | string[] | undefined>;

type BlogPageProps = {
  /**
   * Next.js v15 models search params as a promise for streaming compatibility.
   * Awaiting the promise keeps the runtime flexible and satisfies the new type contract.
   */
  searchParams?: Promise<BlogSearchParams>;
};

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const posts = await getPosts();
  const categories = Array.from(
    new Map(
      posts
        .filter((post) => post.category)
        .map((post) => [post.category!.slug, post.category!]),
    ).values(),
  );

  const resolvedSearchParams = searchParams ? await searchParams : {};

  const rawCategory = resolvedSearchParams.category;
  let requestedCategory: string | undefined;
  if (rawCategory) {
    const categoryValue = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
    try {
      requestedCategory = decodeURIComponent(categoryValue);
    } catch {
      requestedCategory = categoryValue;
    }
  }
  const filteredPosts = requestedCategory
    ? posts.filter(
        (post) =>
          post.category?.slug === requestedCategory ||
          post.category?.title === requestedCategory,
      )
    : posts;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroEyebrow}>The journal</span>
        <h1 className={styles.heroTitle}>Stories to ground and grow with you</h1>
        <p className={styles.heroIntro}>
          Slow down with mindful reflections, seasonal recipes, and wellness practices created to help you feel rooted and nourished.
        </p>
        {categories.length ? (
          <div className={styles.filters}>
            <Link
              href="/blog"
              className={`${styles.filterButton} ${requestedCategory ? "" : styles.filterActive}`}
            >
              All topics
            </Link>
            {categories.map((category) => {
              const isActive = requestedCategory === category.title || requestedCategory === category.slug;
              const href = isActive ? "/blog" : `/blog?category=${encodeURIComponent(category.slug)}`;
              return (
                <Link
                  key={category.slug}
                  href={href}
                  className={`${styles.filterButton} ${isActive ? styles.filterActive : ""}`}
                  style={
                    category.color
                      ? ({
                          color: category.color,
                          borderColor: `${category.color}66`,
                          backgroundColor: isActive ? `${category.color}33` : undefined,
                        } as CSSProperties)
                      : undefined
                  }
                >
                  {category.title}
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      <section>
        {filteredPosts.length ? (
          <PostFeed posts={filteredPosts} />
        ) : (
          <div className={styles.emptyState}>
            <p>No stories in this category yet.</p>
            <p>
              Publish a post in Sanity and assign the
              {requestedCategory ? (
                <>
                  {" "}
                  <strong>{requestedCategory}</strong>
                  {" "}
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
