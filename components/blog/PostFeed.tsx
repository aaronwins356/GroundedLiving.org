"use client";

import { useState } from "react";

import type { BlogPostListItem } from "../../lib/contentful";
import { PostCard } from "./PostCard";

type PostFeedProps = {
  posts: BlogPostListItem[];
  initialCount?: number;
  step?: number;
};

export function PostFeed({ posts, initialCount = 9, step = 6 }: PostFeedProps) {
  const safeInitial = Math.min(Math.max(initialCount, 1), posts.length || 1);
  const safeStep = Math.max(step, 1);
  const [visible, setVisible] = useState(safeInitial);

  const visiblePosts = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  return (
    <div className="space-y-12">
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((count) => Math.min(posts.length, count + safeStep))}
            className="rounded-full border border-emerald-200/80 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 shadow-sm transition hover:border-emerald-400/80 hover:bg-emerald-50"
          >
            Load more stories
          </button>
        </div>
      ) : posts.length ? (
        <p className="text-center text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">
          You have reached the end of the journal
        </p>
      ) : null}
    </div>
  );
}
