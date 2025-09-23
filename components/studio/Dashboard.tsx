import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Filter, Loader2, Plus, Search } from "lucide-react";

import { AuthorForm, AuthorFormState } from "./AuthorForm";
import { PostForm, PostFormState } from "./PostForm";
import { SidebarNav } from "./SidebarNav";
import { SlideOver } from "./SlideOver";
import { ToastProvider, useToast } from "./ToastContext";
import type { StudioAsset, StudioAuthor, StudioPost } from "./types";

import "./styles.css";

const DEFAULT_THEME: "light" | "dark" = "dark";

const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return DEFAULT_THEME;
    }

    return (window.localStorage.getItem("studio-theme") as "light" | "dark") ?? DEFAULT_THEME;
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    window.localStorage.setItem("studio-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
};

const DashboardInner = () => {
  const [activeSection, setActiveSection] = useState<"overview" | "posts" | "authors" | "assets">("overview");
  const [posts, setPosts] = useState<StudioPost[]>([]);
  const [authors, setAuthors] = useState<StudioAuthor[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [loading, setLoading] = useState({ posts: true, authors: true, assets: true });
  const [postQuery, setPostQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [postPanelOpen, setPostPanelOpen] = useState(false);
  const [authorPanelOpen, setAuthorPanelOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<StudioPost | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<StudioAuthor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useToast();

  const fetchPosts = useCallback(async () => {
    setLoading((state) => ({ ...state, posts: true }));
    try {
      const response = await fetch("/api/contentful/blog");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = (await response.json()) as { posts?: StudioPost[] };
      setPosts(data.posts ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch posts";
      notify({ title: "Failed to load posts", description: message, variant: "error" });
    } finally {
      setLoading((state) => ({ ...state, posts: false }));
    }
  }, [notify]);

  const fetchAuthors = useCallback(async () => {
    setLoading((state) => ({ ...state, authors: true }));
    try {
      const response = await fetch("/api/contentful/author");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = (await response.json()) as { authors?: StudioAuthor[] };
      setAuthors(data.authors ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch authors";
      notify({ title: "Failed to load authors", description: message, variant: "error" });
    } finally {
      setLoading((state) => ({ ...state, authors: false }));
    }
  }, [notify]);

  const fetchAssets = useCallback(async () => {
    setLoading((state) => ({ ...state, assets: true }));
    try {
      const response = await fetch("/api/contentful/asset");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = (await response.json()) as { assets?: StudioAsset[] };
      setAssets(data.assets ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch assets";
      notify({ title: "Failed to load assets", description: message, variant: "error" });
    } finally {
      setLoading((state) => ({ ...state, assets: false }));
    }
  }, [notify]);

  useEffect(() => {
    void fetchPosts();
    void fetchAuthors();
    void fetchAssets();
  }, [fetchPosts, fetchAuthors, fetchAssets]);

  const filteredPosts = useMemo(() => {
    if (!postQuery.trim()) {
      return posts;
    }

    const normalizedQuery = postQuery.toLowerCase();

    return posts.filter((post) =>
      [post.title, post.slug, post.authorName]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [postQuery, posts]);

  const filteredAuthors = useMemo(() => {
    if (!authorQuery.trim()) {
      return authors;
    }

    const normalizedQuery = authorQuery.toLowerCase();

    return authors.filter((author) =>
      [author.name, author.bio]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [authorQuery, authors]);

  const openCreatePost = () => {
    setEditingPost(null);
    setPostPanelOpen(true);
  };

  const openCreateAuthor = () => {
    setEditingAuthor(null);
    setAuthorPanelOpen(true);
  };

  const handlePostSubmit = async (payload: PostFormState) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contentful/blog", {
        method: editingPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingPost?.id }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? "Failed to save post");
      }

      notify({
        title: editingPost ? "Post updated" : "Post created",
        description: "Your changes were saved to Contentful.",
        variant: "success",
      });
      setPostPanelOpen(false);
      await fetchPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save post";
      notify({ title: "Failed to save post", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorSubmit = async (payload: AuthorFormState) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contentful/author", {
        method: editingAuthor ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingAuthor?.id }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? "Failed to save author");
      }

      notify({
        title: editingAuthor ? "Author updated" : "Author created",
        description: "The author profile is live.",
        variant: "success",
      });
      setAuthorPanelOpen(false);
      await fetchAuthors();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save author";
      notify({ title: "Failed to save author", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (post: StudioPost) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete “${post.title}”? This cannot be undone.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contentful/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? "Failed to delete post");
      }

      notify({ title: "Post removed", description: "The entry was archived in Contentful.", variant: "success" });
      await fetchPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete post";
      notify({ title: "Deletion failed", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAuthor = async (author: StudioAuthor) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete ${author.name}? This cannot be undone.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contentful/author", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: author.id }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? "Failed to delete author");
      }

      notify({ title: "Author removed", description: "The profile was removed from Contentful.", variant: "success" });
      await fetchAuthors();
      await fetchPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete author";
      notify({ title: "Deletion failed", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await fetch("/api/studio/session", { method: "DELETE" });
    window.location.href = "/studio/login";
  };

  const handleSectionChange = (section: "overview" | "posts" | "authors" | "assets") => {
    setActiveSection(section);

    if (typeof window !== "undefined") {
      const anchor = document.getElementById(`studio-${section}`);
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SidebarNav
        active={activeSection}
        onChange={handleSectionChange}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <div className="flex-1 overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Grounded Studio</p>
              <h1 className="mt-2 text-xl font-semibold text-slate-100">Contentful Control</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                Theme
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-rose-400/70 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="flex flex-col gap-8 px-6 py-10">
          <section id="studio-overview" className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active posts</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-100">{posts.length}</h2>
              <p className="mt-2 text-sm text-slate-400">Entries synced with Contentful.</p>
            </article>
            <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Authors</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-100">{authors.length}</h2>
              <p className="mt-2 text-sm text-slate-400">Voices shaping the narrative.</p>
            </article>
            <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assets</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-100">{assets.length}</h2>
              <p className="mt-2 text-sm text-slate-400">Ready-to-use visuals.</p>
            </article>
          </section>

          <section id="studio-posts" className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Blog posts</h2>
                <p className="text-sm text-slate-400">Manage published stories, drafts, and editorial workflow.</p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                  <Search size={16} className="text-slate-500" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-200 outline-none"
                    placeholder="Filter posts"
                    value={postQuery}
                    onChange={(event) => setPostQuery(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={openCreatePost}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg transition hover:bg-emerald-400"
                >
                  <Plus size={16} />
                  New post
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-xl">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.posts ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <Loader2 className="animate-spin" size={16} /> Loading posts...
                        </div>
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-sm text-slate-400">
                        Nothing matches your filter yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="border-t border-slate-800/50 text-sm text-slate-200">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-100">{post.title}</span>
                            <span className="text-xs text-slate-500">/{post.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              post.status === "published"
                                ? "bg-emerald-500/20 text-emerald-200"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{post.authorName ?? "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(post.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPost(post);
                                setPostPanelOpen(true);
                              }}
                              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post)}
                              className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400/80 hover:text-rose-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section id="studio-authors" className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Authors</h2>
                <p className="text-sm text-slate-400">Curate consistent voices for every publication.</p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                  <Filter size={16} className="text-slate-500" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-200 outline-none"
                    placeholder="Filter authors"
                    value={authorQuery}
                    onChange={(event) => setAuthorQuery(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={openCreateAuthor}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg transition hover:bg-emerald-400"
                >
                  <Plus size={16} />
                  New author
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-xl">
              <table className="w-full min-w-[520px]">
                <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Bio</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.authors ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-6">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <Loader2 className="animate-spin" size={16} /> Loading authors...
                        </div>
                      </td>
                    </tr>
                  ) : filteredAuthors.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-sm text-slate-400">
                        No author profiles match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuthors.map((author) => (
                      <tr key={author.id} className="border-t border-slate-800/50 text-sm text-slate-200">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-100">{author.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {author.bio || "No biography yet."}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAuthor(author);
                                setAuthorPanelOpen(true);
                              }}
                              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAuthor(author)}
                              className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400/80 hover:text-rose-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section id="studio-assets" className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Assets</h2>
                <p className="text-sm text-slate-400">Upload photography, illustrations, and brand visuals.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
              >
                <Plus size={16} />
                Upload asset
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loading.assets ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 rounded-3xl border border-slate-800/60 bg-slate-900/40"
                  />
                ))
              ) : assets.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                  Asset uploads will land here. Integrate the Contentful upload flow when ready.
                </div>
              ) : (
                assets.map((asset) => (
                  <article
                    key={asset.id}
                    className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-lg"
                  >
                    <p className="text-sm font-semibold text-slate-100">{asset.title}</p>
                    <p className="mt-2 text-xs text-slate-500">Updated {new Date(asset.updatedAt).toLocaleDateString()}</p>
                    <a
                      href={asset.file || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
                    >
                      View asset
                    </a>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      <SlideOver
        title={editingPost ? "Edit post" : "Create a new post"}
        description="Synced directly with Contentful entries. Rich text, SEO metadata, and scheduled publishing hook in from here."
        isOpen={postPanelOpen}
        onClose={() => setPostPanelOpen(false)}
      >
        <PostForm
          authors={authors}
          initialPost={editingPost ?? undefined}
          onSubmit={handlePostSubmit}
          onCancel={() => setPostPanelOpen(false)}
          isSubmitting={isSubmitting}
        />
      </SlideOver>

      <SlideOver
        title={editingAuthor ? "Edit author" : "Create a new author"}
        description="Author profiles power attribution, author pages, and future newsletter personalization."
        isOpen={authorPanelOpen}
        onClose={() => setAuthorPanelOpen(false)}
      >
        <AuthorForm
          initialAuthor={editingAuthor ?? undefined}
          onSubmit={handleAuthorSubmit}
          onCancel={() => setAuthorPanelOpen(false)}
          isSubmitting={isSubmitting}
        />
      </SlideOver>
    </div>
  );
};

export const Dashboard = () => (
  <ToastProvider>
    <DashboardInner />
  </ToastProvider>
);

export default Dashboard;
