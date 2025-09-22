"use client";

import { useState } from "react";

import type { PostListItem } from "../../lib/sanity.queries";
import { PostCard } from "./PostCard";
import styles from "./PostFeed.module.css";

type PostFeedProps = {
  posts: PostListItem[];
  initialCount?: number;
  step?: number;
};

export function PostFeed({ posts, initialCount = 9, step = 6 }: PostFeedProps) {
  const safeInitialCount = Math.min(posts.length, Math.max(1, initialCount));
  /**
   * Guard against invalid step values so the control always reveals at least one new post.
   */
  const safeStep = Math.max(1, step);
  const [visibleCount, setVisibleCount] = useState(safeInitialCount);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {visiblePosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {hasMore ? (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => setVisibleCount((count) => Math.min(posts.length, count + safeStep))}
          >
            Load more stories
          </button>
        </div>
      ) : posts.length ? (
        <div className={styles.pagination}>
          <span className={styles.endMessage}>You&rsquo;ve reached the end of the journal.</span>
        </div>
      ) : null}
    </div>
  );
}
