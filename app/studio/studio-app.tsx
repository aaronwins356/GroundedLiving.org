"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";

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
import { useStudioTheme } from "./theme-provider";
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

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "Not yet scheduled";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Unknown timing";
  }

  const diff = timestamp - Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (Math.abs(diff) < hour) {
    return relativeTimeFormatter.format(Math.round(diff / minute), "minute");
  }
  if (Math.abs(diff) < day) {
    return relativeTimeFormatter.format(Math.round(diff / hour), "hour");
  }
  return relativeTimeFormatter.format(Math.round(diff / day), "day");
}

function getInitials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GL";
}

interface ActivityItem {
  id: string;
  label: string;
  type: "Post" | "Page" | "Author";
  status: "draft" | "published";
  updatedAt: string;
}

export function StudioApp({ initialPosts, initialPages, initialAuthors }: StudioAppProps) {
  const { pushToast } = useToast();
  const { theme, toggleTheme } = useStudioTheme();
  const [activeTab, setActiveTab] = useState<StudioTab>("posts");
  const [focusMode, setFocusMode] = useState(false);

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

  const publishedPostCount = useMemo(() => posts.items.filter((item) => item.status === "published").length, [posts.items]);
  const draftPostCount = useMemo(() => posts.items.filter((item) => item.status === "draft").length, [posts.items]);
  const publishedPageCount = useMemo(() => pages.items.filter((item) => item.status === "published").length, [pages.items]);
  const draftPageCount = useMemo(() => pages.items.filter((item) => item.status === "draft").length, [pages.items]);
  const publishedAuthorCount = useMemo(() => authors.items.filter((item) => item.status === "published").length, [authors.items]);
  const draftAuthorCount = useMemo(() => authors.items.filter((item) => item.status === "draft").length, [authors.items]);

  const upcomingPublish = useMemo(() => {
    const scheduled = posts.items
      .filter((post) => {
        if (!post.datePublished) {
          return false;
        }
        const timestamp = new Date(post.datePublished).getTime();
        return !Number.isNaN(timestamp) && timestamp > Date.now();
      })
      .sort((a, b) => new Date(a.datePublished ?? "").getTime() - new Date(b.datePublished ?? "").getTime());

    return scheduled[0] ?? null;
  }, [posts.items]);

  const publishingVelocity = useMemo(() => {
    const twoWeeksAgo = Date.now() - 1000 * 60 * 60 * 24 * 14;
    return posts.items.filter((post) => new Date(post.updatedAt).getTime() >= twoWeeksAgo).length;
  }, [posts.items]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const entries: ActivityItem[] = [
      ...posts.items.map((item) => ({
        id: `post-${item.id}`,
        label: item.title || "Untitled post",
        type: "Post" as const,
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      ...pages.items.map((item) => ({
        id: `page-${item.id}`,
        label: item.title || "Untitled page",
        type: "Page" as const,
        status: item.status,
        updatedAt: item.updatedAt,
      })),
      ...authors.items.map((item) => ({
        id: `author-${item.id}`,
        label: item.title || "Author profile",
        type: "Author" as const,
        status: item.status,
        updatedAt: item.updatedAt,
      })),
    ];

    return entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);
  }, [authors.items, pages.items, posts.items]);

  const latestUpdate = recentActivity[0] ?? null;
  const totalEntries = posts.total + pages.total + authors.total;
  const liveEntries = publishedPostCount + publishedPageCount + publishedAuthorCount;
  const coverage = totalEntries > 0 ? Math.round((liveEntries / totalEntries) * 100) : 0;
  const outstandingDrafts = draftPostCount + draftPageCount + draftAuthorCount;
  const coveragePercent = Math.min(100, Math.max(0, coverage));

  const insights = useMemo(
    () => [
      {
        icon: "📈",
        title: `${publishingVelocity} updates in the last 14 days`,
        description:
          publishingVelocity > 0
            ? "Momentum looks healthy—keep the cadence steady."
            : "No updates in the latest sprint. Queue a story to stay visible.",
      },
      {
        icon: "🗓️",
        title: upcomingPublish
          ? `Next publish ${formatDate(upcomingPublish.datePublished)}`
          : "No publish date scheduled",
        description: upcomingPublish
          ? `“${upcomingPublish.title || "Untitled post"}” goes live ${formatRelativeTime(upcomingPublish.datePublished)}.`
          : "Schedule a post to keep the journal active.",
      },
      {
        icon: "🧭",
        title: `${coverage}% of entries are live`,
        description:
          outstandingDrafts > 0
            ? `${outstandingDrafts} drafts are awaiting polish across posts, pages, and profiles.`
            : "Everything in this view is live—excellent coverage.",
      },
    ],
    [coverage, outstandingDrafts, publishingVelocity, upcomingPublish],
  );

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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Card tinted className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/10" />
          <CardHeader className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                Studio pulse
              </span>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">Editorial performance</CardTitle>
              <CardDescription>
                A live snapshot of production health, upcoming launches, and high-impact opportunities.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-white/70 px-4 py-3 shadow-sm dark:border-emerald-500/30 dark:bg-slate-900/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-lg font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                {coveragePercent}%
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">Content health</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {liveEntries} live / {totalEntries || 0} total
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatPill icon="📝" label="Published posts" value={`${publishedPostCount}`} helper={`${draftPostCount} drafts`} />
              <StatPill icon="📄" label="Published pages" value={`${publishedPageCount}`} helper={`${draftPageCount} drafts`} />
              <StatPill icon="👤" label="Published authors" value={`${publishedAuthorCount}`} helper={`${draftAuthorCount} in progress`} />
              <StatPill icon="⚡" label="14-day velocity" value={`${publishingVelocity}`} helper="recent updates" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span>Coverage</span>
                <span>{coveragePercent}% live</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                  style={{ width: `${Math.max(8, coveragePercent)}%` }}
                />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {insights.map((insight) => (
                <InsightCard key={insight.title} icon={insight.icon} title={insight.title} description={insight.description} />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card tinted className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Next launch</CardTitle>
              <CardDescription>Keep the publishing schedule tight and predictable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPublish ? (
                <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Scheduled</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{upcomingPublish.title || "Untitled post"}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Publishing {formatDate(upcomingPublish.datePublished)} ({formatRelativeTime(upcomingPublish.datePublished)})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status: {upcomingPublish.status}</p>
                </div>
              ) : (
                <CardEmptyState
                  title="No scheduled posts"
                  description="Set a publish date to keep the cadence consistent."
                  icon={<span className="text-2xl">🗓️</span>}
                />
              )}
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 text-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Draft queue</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {outstandingDrafts} items across posts, pages, and author profiles are awaiting review.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card tinted>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Spin up new experiences or update collaborators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => void openPostModal()}>
                ➕ Craft a new post
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => void openPageModal()}>
                📄 Launch a new page
              </Button>
              <Button className="w-full" variant="ghost" onClick={() => void openAuthorModal()}>
                👤 Add an author profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card tinted>
        <CardHeader>
          <CardTitle>Latest activity</CardTitle>
          <CardDescription>Track edits, launches, and team momentum in real time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length === 0 ? (
            <CardEmptyState
              title="No activity yet"
              description="Once content is created you'll see the stream here."
              icon={<span className="text-2xl">✨</span>}
            />
          ) : (
            recentActivity.map((item) => <ActivityRow key={item.id} item={item} />)
          )}
        </CardContent>
      </Card>
    </div>
  );

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
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-emerald-50 shadow-lg">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/80">Grounded Living</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Design studio</h2>
            <p className="mt-3 text-sm text-emerald-50/80">
              A premium control center for launching editorial, marketing, and brand experiences.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
            >
              ↗ View live site
            </Link>
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
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-5 dark:border-slate-800/60 dark:bg-slate-900/60">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Operational highlights</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>• {publishedPostCount} posts live, {draftPostCount} drafts</li>
              <li>• {publishedPageCount} pages published</li>
              <li>• {publishedAuthorCount} author profiles ready</li>
              <li>• Next launch {upcomingPublish ? formatRelativeTime(upcomingPublish.datePublished) : "to be scheduled"}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-5 text-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Need support?</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Book a strategy session or request updates from the design team.</p>
            <Link
              href="mailto:studio@groundedliving.org"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200/60 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
            >
              ✉️ studio@groundedliving.org
            </Link>
          </div>
        </div>
      </aside>
      <main className="flex-1 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white/80 px-6 py-5 shadow-xl shadow-slate-200/30 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                Professional workspace
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Grounded Living</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Grounded Living Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Craft thoughtful stories with a wellness-focused editorial toolkit.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 dark:bg-slate-50/10">
                Latest update: {latestUpdate ? formatRelativeTime(latestUpdate.updatedAt) : "Awaiting first edit"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 dark:bg-slate-50/10">
                {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/70 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/60">
              <span>Focus mode</span>
              <Switch
                checked={focusMode}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setFocusMode(event.target.checked)}
                aria-label="Toggle focus mode"
              />
            </div>
            <Button variant="ghost" onClick={toggleTheme} className="text-sm">
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </Button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700/60 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
            >
              ↗ View site
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-3 py-1.5 dark:border-slate-800/60 dark:bg-slate-900/60">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                {getInitials("Studio Admin")}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Studio Admin</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Team lead</p>
              </div>
            </div>
          </div>
        </header>
        {focusMode ? (
          <Card tinted>
            <CardHeader>
              <CardTitle>Focus mode enabled</CardTitle>
              <CardDescription>We’ve hidden the dashboard overview so you can concentrate on the current task.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Switch focus mode off to reveal studio analytics, quick actions, and recent activity.</p>
            </CardContent>
          </Card>
        ) : (
          renderOverview()
        )}
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

interface StatPillProps {
  icon: string;
  label: string;
  value: string;
  helper?: string;
}

function StatPill({ icon, label, value, helper }: StatPillProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
      <span className="text-xl">{icon}</span>
      <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      {helper ? <span className="text-xs text-slate-400 dark:text-slate-500">{helper}</span> : null}
    </div>
  );
}

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
}

function InsightCard({ icon, title, description }: InsightCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/60 bg-white/70 p-4 text-sm dark:border-slate-800/60 dark:bg-slate-900/50">
      <span className="text-lg">{icon}</span>
      <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-3 dark:border-slate-800/60 dark:bg-slate-900/50">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {item.type} • Updated {formatRelativeTime(item.updatedAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {statusBadge(item.status)}
        <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(item.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
