import React, { useEffect, useMemo, useState } from "react";

import { StudioAuthor, StudioPost } from "./types";

interface PostFormProps {
  authors: StudioAuthor[];
  initialPost?: StudioPost | null;
  onSubmit: (payload: PostFormState) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface PostFormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorId: string;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const createStateFromPost = (post?: StudioPost | null): PostFormState => ({
  title: post?.title ?? "",
  slug: post?.slug ?? "",
  excerpt: post?.excerpt ?? "",
  body: post?.body ?? "",
  authorId: post?.authorId ?? "",
});

export const PostForm = ({ authors, initialPost, onSubmit, onCancel, isSubmitting }: PostFormProps) => {
  const [state, setState] = useState<PostFormState>(() => createStateFromPost(initialPost));
  const [autoSlug, setAutoSlug] = useState(!initialPost?.slug);

  useEffect(() => {
    setState(createStateFromPost(initialPost));
    setAutoSlug(!initialPost?.slug);
  }, [initialPost]);

  useEffect(() => {
    if (!autoSlug) {
      return;
    }

    setState((current) => ({
      ...current,
      slug: toSlug(current.title),
    }));
  }, [state.title, autoSlug]);

  const canSubmit = useMemo(() => state.title.trim() && state.slug.trim(), [state.title, state.slug]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setState((current) => ({ ...current, [name]: value }));
    if (name === "slug") {
      setAutoSlug(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    await onSubmit(state);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-200">Title</span>
          <input
            required
            name="title"
            value={state.title}
            onChange={handleChange}
            placeholder="Designing regenerative habitats"
            className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-200">Slug</span>
          <input
            required
            name="slug"
            value={state.slug}
            onChange={handleChange}
            placeholder="regenerative-habitats"
            className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-200">Author</span>
        <select
          name="authorId"
          value={state.authorId}
          onChange={handleChange}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        >
          <option value="">Unassigned</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-200">Excerpt</span>
        <textarea
          name="excerpt"
          value={state.excerpt}
          onChange={handleChange}
          rows={3}
          placeholder="A quick synopsis for your hero sections and previews"
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-200">Body</span>
        <textarea
          name="body"
          value={state.body}
          onChange={handleChange}
          rows={8}
          placeholder="Long-form copy, markdown, or rich text"
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />
      </label>
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : initialPost ? "Update post" : "Create post"}
        </button>
      </div>
    </form>
  );
};
