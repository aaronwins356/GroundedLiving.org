"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardEmptyState, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import type {
  AuthorDetail,
  BlogPostDetail,
  BlogPostSummary,
  PageDetail,
  PageSummary,
  PaginatedResponse,
  StudioAsset,
} from "../../lib/contentfulManagement";
import { useToast } from "../../components/ui/toaster";
import { logout } from "./actions";
import { PAGE_SIZE } from "./constants";
import { RichTextEditor } from "./rich-text-editor";
import { useUnsavedChanges } from "./use-unsaved-changes";

interface StudioAppProps {
  initialPosts: PaginatedResponse<BlogPostSummary>;
  initialPages: PaginatedResponse<PageSummary>;
  initialAuthors: PaginatedResponse<AuthorDetail>;
}

type StudioTab = "posts" | "pages" | "authors" | "settings";

interface EditorState<T> {
  mode: "create" | "edit";
  value: T;
  isOpen: boolean;
  isSaving: boolean;
  hasChanges: boolean;
}

const NAVIGATION: Array<{ id: StudioTab; label: string; icon: string }> = [
  { id: "posts", label: "Blog Posts", icon: "📝" },
  { id: "pages", label: "Pages", icon: "📑" },
  { id: "authors", label: "Authors", icon: "👤" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const DEFAULT_POST: BlogPostDetail = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  tags: [],
  datePublished: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "draft",
  publishedAt: null,
  content: {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          { nodeType: "text", value: "", marks: [] },
        ],
      },
    ],
  },
  authorId: undefined,
  heroImage: null,
  seo: {
    title: "",
    description: "",
    canonicalUrl: "",
    ogImage: null,
  },
};

const DEFAULT_PAGE: PageDetail = {
  id: "",
  title: "",
  slug: "",
  navigationLabel: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "draft",
  publishedAt: null,
  content: {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          { nodeType: "text", value: "", marks: [] },
        ],
      },
    ],
  },
  heroImage: null,
  seo: {
    title: "",
    description: "",
    canonicalUrl: "",
    ogImage: null,
  },
};

const DEFAULT_AUTHOR: AuthorDetail = {
  id: "",
  title: "",
  slug: null,
  bio: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "draft",
  publishedAt: null,
  profileImage: null,
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "Unexpected error");
  }

  return (await response.json()) as T;
}

function toTagArray(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString();
}

function statusBadge(status: "draft" | "published") {
  return status === "published" ? <Badge variant="success">Published</Badge> : <Badge variant="outline">Draft</Badge>;
}

export function StudioApp({ initialPosts, initialPages, initialAuthors }: StudioAppProps) {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<StudioTab>("posts");

  const [posts, setPosts] = useState(initialPosts);
  const [postPage, setPostPage] = useState(1);
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postEditor, setPostEditor] = useState<EditorState<BlogPostDetail>>({
    mode: "create",
    value: DEFAULT_POST,
    isOpen: false,
    isSaving: false,
    hasChanges: false,
  });

  const [pages, setPages] = useState(initialPages);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSearch, setPageSearch] = useState("");
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pageEditor, setPageEditor] = useState<EditorState<PageDetail>>({
    mode: "create",
    value: DEFAULT_PAGE,
    isOpen: false,
    isSaving: false,
    hasChanges: false,
  });

  const [authors, setAuthors] = useState(initialAuthors);
  const [authorSearch, setAuthorSearch] = useState("");
  const [authorEditor, setAuthorEditor] = useState<EditorState<AuthorDetail>>({
    mode: "create",
    value: DEFAULT_AUTHOR,
    isOpen: false,
    isSaving: false,
    hasChanges: false,
  });

  useUnsavedChanges(postEditor.isOpen && postEditor.hasChanges);
  useUnsavedChanges(pageEditor.isOpen && pageEditor.hasChanges);
  useUnsavedChanges(authorEditor.isOpen && authorEditor.hasChanges);

  const filteredPosts = useMemo(() => {
    return posts.items.filter((item) => {
      if (postStatusFilter === "all") {
        return true;
      }
      return item.status === postStatusFilter;
    });
  }, [posts.items, postStatusFilter]);

  const postsPageCount = Math.max(1, Math.ceil(posts.total / posts.limit));
  const pagesPageCount = Math.max(1, Math.ceil(pages.total / pages.limit));
  const authorsPageCount = Math.max(1, Math.ceil(authors.total / authors.limit));

  const loadPosts = useCallback(
    async (page: number, search: string) => {
      setIsLoadingPosts(true);
      try {
        const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (search) {
          query.set("search", search);
        }
        const response = await fetchJson<PaginatedResponse<BlogPostSummary>>(`/api/studio/blog-posts?${query.toString()}`);
        setPosts(response);
      } catch (error) {
        pushToast({ title: "Unable to load posts", description: (error as Error).message, variant: "error" });
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [pushToast],
  );

  const loadPages = useCallback(
    async (page: number, search: string) => {
      setIsLoadingPages(true);
      try {
        const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (search) {
          query.set("search", search);
        }
        const response = await fetchJson<PaginatedResponse<PageSummary>>(`/api/studio/pages?${query.toString()}`);
        setPages(response);
      } catch (error) {
        pushToast({ title: "Unable to load pages", description: (error as Error).message, variant: "error" });
      } finally {
        setIsLoadingPages(false);
      }
    },
    [pushToast],
  );

  const loadAuthors = useCallback(
    async (page: number, search: string) => {
      try {
        const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (search) {
          query.set("search", search);
        }
        const response = await fetchJson<PaginatedResponse<AuthorDetail>>(`/api/studio/authors?${query.toString()}`);
        setAuthors(response);
      } catch (error) {
        pushToast({ title: "Unable to load authors", description: (error as Error).message, variant: "error" });
      }
    },
    [pushToast],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadPosts(1, postSearch);
      setPostPage(1);
    }, 320);
    return () => window.clearTimeout(handle);
  }, [postSearch, loadPosts]);

  useEffect(() => {
    void loadPosts(postPage, postSearch);
  }, [postPage, loadPosts, postSearch]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadPages(1, pageSearch);
      setPageIndex(1);
    }, 320);
    return () => window.clearTimeout(handle);
  }, [pageSearch, loadPages]);

  useEffect(() => {
    void loadPages(pageIndex, pageSearch);
  }, [pageIndex, loadPages, pageSearch]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadAuthors(1, authorSearch);
    }, 320);
    return () => window.clearTimeout(handle);
  }, [authorSearch, loadAuthors]);

  const openPostModal = useCallback(
    async (id?: string) => {
      try {
        if (!id) {
          setPostEditor({
            mode: "create",
            value: { ...DEFAULT_POST, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            isOpen: true,
            isSaving: false,
            hasChanges: false,
          });
          return;
        }
        const detail = await fetchJson<BlogPostDetail>(`/api/studio/blog-posts/${id}`);
        setPostEditor({ mode: "edit", value: detail, isOpen: true, isSaving: false, hasChanges: false });
      } catch (error) {
        pushToast({ title: "Unable to load post", description: (error as Error).message, variant: "error" });
      }
    },
    [pushToast],
  );

  const openPageModal = useCallback(
    async (id?: string) => {
      try {
        if (!id) {
          setPageEditor({
            mode: "create",
            value: { ...DEFAULT_PAGE, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            isOpen: true,
            isSaving: false,
            hasChanges: false,
          });
          return;
        }
        const detail = await fetchJson<PageDetail>(`/api/studio/pages/${id}`);
        setPageEditor({ mode: "edit", value: detail, isOpen: true, isSaving: false, hasChanges: false });
      } catch (error) {
        pushToast({ title: "Unable to load page", description: (error as Error).message, variant: "error" });
      }
    },
    [pushToast],
  );

  const openAuthorModal = useCallback(
    async (id?: string) => {
      try {
        if (!id) {
          setAuthorEditor({
            mode: "create",
            value: { ...DEFAULT_AUTHOR, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            isOpen: true,
            isSaving: false,
            hasChanges: false,
          });
          return;
        }
        const detail = await fetchJson<AuthorDetail>(`/api/studio/authors/${id}`);
        setAuthorEditor({ mode: "edit", value: detail, isOpen: true, isSaving: false, hasChanges: false });
      } catch (error) {
        pushToast({ title: "Unable to load author", description: (error as Error).message, variant: "error" });
      }
    },
    [pushToast],
  );

  const closeEditors = () => {
    setPostEditor((state) => ({ ...state, isOpen: false, hasChanges: false }));
    setPageEditor((state) => ({ ...state, isOpen: false, hasChanges: false }));
    setAuthorEditor((state) => ({ ...state, isOpen: false, hasChanges: false }));
  };

  const updatePostDraft = (partial: Partial<BlogPostDetail>) => {
    setPostEditor((state) => ({
      ...state,
      value: { ...state.value, ...partial },
      hasChanges: true,
    }));
  };

  const updatePageDraft = (partial: Partial<PageDetail>) => {
    setPageEditor((state) => ({
      ...state,
      value: { ...state.value, ...partial },
      hasChanges: true,
    }));
  };

  const updateAuthorDraft = (partial: Partial<AuthorDetail>) => {
    setAuthorEditor((state) => ({
      ...state,
      value: { ...state.value, ...partial },
      hasChanges: true,
    }));
  };

  const savePost = async (publish: boolean) => {
    setPostEditor((state) => ({ ...state, isSaving: true }));
    try {
      const { value, mode } = postEditor;
      const payload = { ...value, tags: value.tags ?? [], status: publish ? "published" : "draft" };
      const endpoint = mode === "edit" && value.id ? `/api/studio/blog-posts/${value.id}` : "/api/studio/blog-posts";
      const method = mode === "edit" && value.id ? "PUT" : "POST";
      const saved = await fetchJson<BlogPostDetail>(endpoint, { method, body: JSON.stringify(payload) });
      pushToast({
        title: mode === "edit" ? "Post updated" : "Post created",
        description: publish ? "The post is live and available on the site." : "Saved as draft.",
        variant: "success",
      });
      setPostEditor({ mode: "edit", value: saved, isOpen: true, isSaving: false, hasChanges: false });
      await loadPosts(postPage, postSearch);
    } catch (error) {
      pushToast({ title: "Failed to save post", description: (error as Error).message, variant: "error" });
      setPostEditor((state) => ({ ...state, isSaving: false }));
    }
  };

  const deletePost = async (id: string) => {
    if (!window.confirm("Delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await fetchJson(`/api/studio/blog-posts/${id}`, { method: "DELETE" });
      pushToast({ title: "Post deleted", variant: "success" });
      await loadPosts(postPage, postSearch);
    } catch (error) {
      pushToast({ title: "Failed to delete post", description: (error as Error).message, variant: "error" });
    }
  };

  const savePage = async (publish: boolean) => {
    setPageEditor((state) => ({ ...state, isSaving: true }));
    try {
      const { value, mode } = pageEditor;
      const payload = { ...value, status: publish ? "published" : "draft" };
      const endpoint = mode === "edit" && value.id ? `/api/studio/pages/${value.id}` : "/api/studio/pages";
      const method = mode === "edit" && value.id ? "PUT" : "POST";
      const saved = await fetchJson<PageDetail>(endpoint, { method, body: JSON.stringify(payload) });
      pushToast({
        title: mode === "edit" ? "Page updated" : "Page created",
        description: publish ? "Page is now live." : "Saved as draft.",
        variant: "success",
      });
      setPageEditor({ mode: "edit", value: saved, isOpen: true, isSaving: false, hasChanges: false });
      await loadPages(pageIndex, pageSearch);
    } catch (error) {
      pushToast({ title: "Failed to save page", description: (error as Error).message, variant: "error" });
      setPageEditor((state) => ({ ...state, isSaving: false }));
    }
  };

  const deletePage = async (id: string) => {
    if (!window.confirm("Delete this page?")) {
      return;
    }
    try {
      await fetchJson(`/api/studio/pages/${id}`, { method: "DELETE" });
      pushToast({ title: "Page deleted", variant: "success" });
      await loadPages(pageIndex, pageSearch);
    } catch (error) {
      pushToast({ title: "Failed to delete page", description: (error as Error).message, variant: "error" });
    }
  };

  const saveAuthor = async (publish: boolean) => {
    setAuthorEditor((state) => ({ ...state, isSaving: true }));
    try {
      const { value, mode } = authorEditor;
      const payload = { ...value, status: publish ? "published" : "draft" };
      const endpoint = mode === "edit" && value.id ? `/api/studio/authors/${value.id}` : "/api/studio/authors";
      const method = mode === "edit" && value.id ? "PUT" : "POST";
      const saved = await fetchJson<AuthorDetail>(endpoint, { method, body: JSON.stringify(payload) });
      pushToast({
        title: mode === "edit" ? "Author updated" : "Author created",
        description: publish ? "Author profile published." : "Saved as draft.",
        variant: "success",
      });
      setAuthorEditor({ mode: "edit", value: saved, isOpen: true, isSaving: false, hasChanges: false });
      await loadAuthors(1, authorSearch);
    } catch (error) {
      pushToast({ title: "Failed to save author", description: (error as Error).message, variant: "error" });
      setAuthorEditor((state) => ({ ...state, isSaving: false }));
    }
  };

  const deleteAuthor = async (id: string) => {
    if (!window.confirm("Delete this author profile?")) {
      return;
    }

    try {
      await fetchJson(`/api/studio/authors/${id}`, { method: "DELETE" });
      pushToast({ title: "Author removed", variant: "success" });
      await loadAuthors(1, authorSearch);
    } catch (error) {
      pushToast({ title: "Failed to delete author", description: (error as Error).message, variant: "error" });
    }
  };

  const renderPosts = () => (
    <Card tinted>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Blog posts</CardTitle>
          <CardDescription>Organize long-form storytelling and publish to the journal with ease.</CardDescription>
        </div>
        <Button onClick={() => void openPostModal()}>➕ New post</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            value={postSearch}
            onChange={(event) => setPostSearch(event.target.value)}
            placeholder="Search posts by title, slug, or keywords"
            leadingIcon={<span>🔍</span>}
          />
          <Select value={postStatusFilter} onChange={(event) => setPostStatusFilter(event.target.value as typeof postStatusFilter)}>
            <option value="all">All statuses</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </Select>
        </div>
        <div className="space-y-3">
          {isLoadingPosts ? (
            <p className="text-sm text-slate-500">Loading posts...</p>
          ) : filteredPosts.length === 0 ? (
            <CardEmptyState
              title="No posts yet"
              description="Create your first story to unlock studio workflows."
              icon={<span className="text-2xl">🌱</span>}
            />
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-4 shadow-sm transition hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-left text-base font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100"
                      onClick={() => void openPostModal(post.id)}
                    >
                      {post.title || "Untitled post"}
                    </button>
                    {statusBadge(post.status)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Slug: {post.slug || "—"}</p>
                  <p className="text-xs text-slate-400">Updated {new Date(post.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-500">
                    <p>Scheduled</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(post.datePublished)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void openPostModal(post.id)}>
                    ✏️ Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void deletePost(post.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {posts.total > PAGE_SIZE ? (
          <div className="flex items-center justify-end gap-3 text-sm text-slate-500">
            <span>
              Page {postPage} of {postsPageCount}
            </span>
            <Button variant="ghost" size="sm" disabled={postPage <= 1} onClick={() => setPostPage((page) => Math.max(1, page - 1))}>
              ← Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={postPage >= postsPageCount}
              onClick={() => setPostPage((page) => Math.min(postsPageCount, page + 1))}
            >
              Next →
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderPages = () => (
    <Card tinted>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Site pages</CardTitle>
          <CardDescription>Maintain evergreen content like About, Contact, and landing pages.</CardDescription>
        </div>
        <Button onClick={() => void openPageModal()}>➕ New page</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            value={pageSearch}
            onChange={(event) => setPageSearch(event.target.value)}
            placeholder="Search by title or slug"
            leadingIcon={<span>🔍</span>}
          />
        </div>
        <div className="space-y-3">
          {isLoadingPages ? (
            <p className="text-sm text-slate-500">Loading pages...</p>
          ) : pages.items.length === 0 ? (
            <CardEmptyState
              title="No pages created"
              description="Build marketing pages directly from the studio."
              icon={<span className="text-2xl">📄</span>}
            />
          ) : (
            pages.items.map((page) => (
              <div
                key={page.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-4 shadow-sm transition hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-left text-base font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100"
                      onClick={() => void openPageModal(page.id)}
                    >
                      {page.title || "Untitled page"}
                    </button>
                    {statusBadge(page.status)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Slug: {page.slug || "—"}</p>
                  {page.navigationLabel ? <p className="text-xs text-slate-400">Navigation: {page.navigationLabel}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => void openPageModal(page.id)}>
                    ✏️ Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void deletePage(page.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {pages.total > PAGE_SIZE ? (
          <div className="flex items-center justify-end gap-3 text-sm text-slate-500">
            <span>
              Page {pageIndex} of {pagesPageCount}
            </span>
            <Button variant="ghost" size="sm" disabled={pageIndex <= 1} onClick={() => setPageIndex((page) => Math.max(1, page - 1))}>
              ← Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pageIndex >= pagesPageCount}
              onClick={() => setPageIndex((page) => Math.min(pagesPageCount, page + 1))}
            >
              Next →
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderAuthors = () => (
    <Card tinted>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Authors</CardTitle>
          <CardDescription>Maintain voice consistency by curating author bios and avatars.</CardDescription>
        </div>
        <Button onClick={() => void openAuthorModal()}>➕ New author</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            value={authorSearch}
            onChange={(event) => setAuthorSearch(event.target.value)}
            placeholder="Search by name"
            leadingIcon={<span>🔍</span>}
          />
        </div>
        <div className="space-y-3">
          {authors.items.length === 0 ? (
            <CardEmptyState
              title="No author profiles"
              description="Introduce the humans behind the words."
              icon={<span className="text-2xl">👋</span>}
            />
          ) : (
            authors.items.map((author) => (
              <div
                key={author.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-4 shadow-sm transition hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-left text-base font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100"
                      onClick={() => void openAuthorModal(author.id)}
                    >
                      {author.title || "Author"}
                    </button>
                    {statusBadge(author.status)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{author.bio || "No bio yet."}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => void openAuthorModal(author.id)}>
                    ✏️ Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void deleteAuthor(author.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {authors.total > PAGE_SIZE ? (
          <div className="flex items-center justify-end gap-3 text-sm text-slate-500">
            <span>
              Page 1 of {authorsPageCount}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <Card tinted>
      <CardHeader>
        <CardTitle>Studio settings</CardTitle>
        <CardDescription>Manage account access and environment configuration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 dark:border-slate-800/60 dark:bg-slate-900/60">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Environment variables</h4>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            The studio relies on Contentful Management credentials and the <code className="rounded bg-slate-900/5 px-1 py-0.5 text-[11px] uppercase tracking-wide dark:bg-slate-50/10">STUDIO_ADMIN_KEY</code> for authentication.
            Rotate keys regularly and deploy via Vercel for instant propagation.
          </p>
        </div>
        <form action={logout} className="flex items-center justify-between rounded-2xl border border-rose-200/60 bg-rose-50/70 p-6 dark:border-rose-500/20 dark:bg-rose-500/10">
          <div>
            <h4 className="text-lg font-semibold text-rose-700 dark:text-rose-200">Sign out</h4>
            <p className="text-sm text-rose-600/80 dark:text-rose-200/70">Clear the studio session cookie to require the admin key again.</p>
          </div>
          <Button type="submit" variant="destructive">
            Log out
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-1 gap-6 pb-10">
      <aside className="w-full max-w-xs rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 lg:sticky lg:top-10 lg:h-[calc(100vh-80px)] lg:w-72">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Studio</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Premium control center for Grounded Living.</p>
          </div>
          <nav className="flex flex-col gap-2">
            {NAVIGATION.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-emerald-500/90 to-emerald-400/80 text-white shadow-lg shadow-emerald-400/20"
                    : "text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-slate-50/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </span>
                {activeTab === item.id ? <span className="text-xs">Active</span> : null}
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white/80 px-6 py-5 shadow-xl shadow-slate-200/30 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Grounded Living Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Craft thoughtful stories with a wellness-focused editorial toolkit.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {new Date().toLocaleString()}
            </span>
          </div>
        </header>
        {activeTab === "posts" ? renderPosts() : null}
        {activeTab === "pages" ? renderPages() : null}
        {activeTab === "authors" ? renderAuthors() : null}
        {activeTab === "settings" ? renderSettings() : null}
      </main>

      {postEditor.isOpen ? (
        <EditorOverlay
          title={postEditor.mode === "edit" ? "Edit post" : "New post"}
          onClose={closeEditors}
          footer={
            <div className="flex flex-wrap justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last saved {new Date(postEditor.value.updatedAt).toLocaleString()}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={closeEditors}>
                  Close
                </Button>
                <Button variant="secondary" loading={postEditor.isSaving} onClick={() => void savePost(false)}>
                  Save draft
                </Button>
                <Button loading={postEditor.isSaving} onClick={() => void savePost(true)}>
                  Publish
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={postEditor.value.title}
                onChange={(event) => updatePostDraft({ title: event.target.value })}
                placeholder="A soulful headline"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-slug">Slug</Label>
              <Input
                id="post-slug"
                value={postEditor.value.slug ?? ""}
                onChange={(event) => updatePostDraft({ slug: event.target.value })}
                placeholder="wellness-journal-entry"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea
                id="post-excerpt"
                value={postEditor.value.excerpt ?? ""}
                onChange={(event) => updatePostDraft({ excerpt: event.target.value })}
                placeholder="Write a poetic teaser..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <RichTextEditor value={postEditor.value.content} onChange={(content) => updatePostDraft({ content })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-tags">Tags</Label>
              <Input
                id="post-tags"
                value={(postEditor.value.tags ?? []).join(", ")}
                onChange={(event) => updatePostDraft({ tags: toTagArray(event.target.value) })}
                placeholder="rituals, slow living, botanicals"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-date">Publish date</Label>
              <Input
                id="post-date"
                type="date"
                value={postEditor.value.datePublished?.slice(0, 10) ?? ""}
                onChange={(event) => updatePostDraft({ datePublished: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-author">Author</Label>
              <Select
                id="post-author"
                value={postEditor.value.authorId ?? ""}
                onChange={(event) => updatePostDraft({ authorId: event.target.value || undefined })}
              >
                <option value="">— Select author —</option>
                {authors.items.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>SEO metadata</Label>
              <div className="grid gap-2 rounded-2xl border border-slate-200/60 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
                <Input
                  value={postEditor.value.seo?.title ?? ""}
                  onChange={(event) => updatePostDraft({ seo: { ...postEditor.value.seo, title: event.target.value } })}
                  placeholder="SEO title"
                />
                <Textarea
                  value={postEditor.value.seo?.description ?? ""}
                  onChange={(event) => updatePostDraft({ seo: { ...postEditor.value.seo, description: event.target.value } })}
                  placeholder="SEO description"
                />
                <Input
                  value={postEditor.value.seo?.canonicalUrl ?? ""}
                  onChange={(event) => updatePostDraft({ seo: { ...postEditor.value.seo, canonicalUrl: event.target.value } })}
                  placeholder="Canonical URL"
                />
              </div>
            </div>
          </div>
        </EditorOverlay>
      ) : null}

      {pageEditor.isOpen ? (
        <EditorOverlay
          title={pageEditor.mode === "edit" ? "Edit page" : "New page"}
          onClose={closeEditors}
          footer={
            <div className="flex flex-wrap justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last saved {new Date(pageEditor.value.updatedAt).toLocaleString()}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={closeEditors}>
                  Close
                </Button>
                <Button variant="secondary" loading={pageEditor.isSaving} onClick={() => void savePage(false)}>
                  Save draft
                </Button>
                <Button loading={pageEditor.isSaving} onClick={() => void savePage(true)}>
                  Publish
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="page-title">Title</Label>
              <Input
                id="page-title"
                value={pageEditor.value.title}
                onChange={(event) => updatePageDraft({ title: event.target.value })}
                placeholder="Page title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="page-slug">Slug</Label>
              <Input
                id="page-slug"
                value={pageEditor.value.slug ?? ""}
                onChange={(event) => updatePageDraft({ slug: event.target.value })}
                placeholder="about"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="page-nav">Navigation label</Label>
              <Input
                id="page-nav"
                value={pageEditor.value.navigationLabel ?? ""}
                onChange={(event) => updatePageDraft({ navigationLabel: event.target.value })}
                placeholder="About"
              />
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <RichTextEditor value={pageEditor.value.content} onChange={(content) => updatePageDraft({ content })} />
            </div>
            <div className="grid gap-2">
              <Label>SEO metadata</Label>
              <div className="grid gap-2 rounded-2xl border border-slate-200/60 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
                <Input
                  value={pageEditor.value.seo?.title ?? ""}
                  onChange={(event) => updatePageDraft({ seo: { ...pageEditor.value.seo, title: event.target.value } })}
                  placeholder="SEO title"
                />
                <Textarea
                  value={pageEditor.value.seo?.description ?? ""}
                  onChange={(event) => updatePageDraft({ seo: { ...pageEditor.value.seo, description: event.target.value } })}
                  placeholder="SEO description"
                />
                <Input
                  value={pageEditor.value.seo?.canonicalUrl ?? ""}
                  onChange={(event) => updatePageDraft({ seo: { ...pageEditor.value.seo, canonicalUrl: event.target.value } })}
                  placeholder="Canonical URL"
                />
              </div>
            </div>
          </div>
        </EditorOverlay>
      ) : null}

      {authorEditor.isOpen ? (
        <EditorOverlay
          title={authorEditor.mode === "edit" ? "Edit author" : "New author"}
          onClose={closeEditors}
          footer={
            <div className="flex flex-wrap justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last saved {new Date(authorEditor.value.updatedAt).toLocaleString()}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={closeEditors}>
                  Close
                </Button>
                <Button variant="secondary" loading={authorEditor.isSaving} onClick={() => void saveAuthor(false)}>
                  Save draft
                </Button>
                <Button loading={authorEditor.isSaving} onClick={() => void saveAuthor(true)}>
                  Publish
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="author-name">Name</Label>
              <Input
                id="author-name"
                value={authorEditor.value.title}
                onChange={(event) => updateAuthorDraft({ title: event.target.value })}
                placeholder="Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author-bio">Bio</Label>
              <Textarea
                id="author-bio"
                value={authorEditor.value.bio ?? ""}
                onChange={(event) => updateAuthorDraft({ bio: event.target.value })}
                placeholder="Short biography"
              />
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Profile image</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Upload images via the Assets panel (coming soon) or paste an asset ID. This placeholder keeps the workflow ready for integration.
              </p>
              <Input
                className="mt-3"
                placeholder="Contentful asset ID"
                value={authorEditor.value.profileImage?.id ?? ""}
                onChange={(event) =>
                  updateAuthorDraft({ profileImage: event.target.value ? ({ id: event.target.value } as StudioAsset) : null })
                }
              />
            </div>
          </div>
        </EditorOverlay>
      ) : null}
    </div>
  );
}

interface EditorOverlayProps {
  title: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}

function EditorOverlay({ title, onClose, footer, children }: EditorOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-2xl shadow-emerald-200/40 dark:border-slate-800/60 dark:bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        <div className="border-t border-slate-200/60 bg-white/80 px-6 py-4 dark:border-slate-800/60 dark:bg-slate-900/80">
          {footer}
        </div>
      </div>
    </div>
  );
}
