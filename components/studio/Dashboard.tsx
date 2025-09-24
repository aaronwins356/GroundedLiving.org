"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Plus, Search, X } from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select } from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { cn } from "@lib/utils/cn";
import type { RichTextDocument, RichTextNode } from "@project-types/contentful";

import type { StudioPostDetail, StudioPostSummary } from "./types";

interface EditorState {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  datePublished: string;
  seoDescription: string;
  coverImageId: string;
  authorId: string;
  status: "draft" | "published";
}

interface ApiResponse<T> {
  items?: T[];
  data?: T;
}

const emptyEditorState: EditorState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  datePublished: "",
  seoDescription: "",
  coverImageId: "",
  authorId: "",
  status: "draft",
};

function richTextToPlain(document: RichTextDocument | null): string {
  if (!document?.content?.length) {
    return "";
  }

  const paragraphs: string[] = [];

  const visit = (nodes: RichTextNode[]) => {
    nodes.forEach((node) => {
      if (node.nodeType === "paragraph") {
        const text = (node.content ?? [])
          .map((child) => (typeof child.value === "string" ? child.value : ""))
          .join("");
        paragraphs.push(text.trim());
      }
      if (node.content) {
        visit(node.content);
      }
    });
  };

  visit(document.content);
  return paragraphs.filter(Boolean).join("\n\n");
}

function plainToRichText(value: string): RichTextDocument {
  const blocks = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      nodeType: "paragraph" as const,
      content: [
        {
          nodeType: "text" as const,
          value: paragraph,
          marks: [],
        },
      ],
    } satisfies RichTextNode));

  return {
    nodeType: "document",
    content: blocks.length ? blocks : [
      {
        nodeType: "paragraph",
        content: [
          {
            nodeType: "text",
            value: "",
            marks: [],
          },
        ],
      },
    ],
  } satisfies RichTextDocument;
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

function fromDateTimeLocal(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

export function Dashboard() {
  const [posts, setPosts] = useState<StudioPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(emptyEditorState);
  const [banner, setBanner] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/studio/blog-posts");
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as ApiResponse<StudioPostSummary> & {
        total?: number;
      };
      setPosts(payload.items ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load posts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    const text = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }
      if (!text) {
        return true;
      }
      const haystack = [post.title, post.slug ?? "", post.excerpt ?? "", post.seoDescription ?? ""].join(" ");
      return haystack.toLowerCase().includes(text);
    });
  }, [posts, search, statusFilter]);

  const openEditorForNew = () => {
    setEditorState(emptyEditorState);
    setEditorOpen(true);
    setBanner(null);
  };

  const openEditorForExisting = async (id: string) => {
    setEditorOpen(true);
    setEditorLoading(true);
    setBanner(null);
    try {
      const response = await fetch(`/api/studio/blog-posts/${id}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = (await response.json()) as StudioPostDetail;
      setEditorState({
        id: payload.id,
        title: payload.title,
        slug: payload.slug ?? "",
        excerpt: payload.excerpt ?? "",
        content: richTextToPlain(payload.content),
        datePublished: toDateTimeLocal(payload.datePublished ?? payload.publishedAt ?? ""),
        seoDescription: payload.seoDescription ?? "",
        coverImageId: payload.coverImage?.id ?? "",
        authorId: payload.authorId ?? "",
        status: payload.status,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load the post";
      setBanner(message);
    } finally {
      setEditorLoading(false);
    }
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorState(emptyEditorState);
    setEditorLoading(false);
    setBanner(null);
  };

  const handleFieldChange = (field: keyof EditorState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setEditorState((state) => ({ ...state, [field]: event.target.value }));
    };

  const handleSubmit = async () => {
    try {
      setEditorLoading(true);
      setBanner(null);

      const payload = {
        title: editorState.title,
        slug: editorState.slug || undefined,
        excerpt: editorState.excerpt || undefined,
        content: plainToRichText(editorState.content),
        datePublished: fromDateTimeLocal(editorState.datePublished),
        seoDescription: editorState.seoDescription || undefined,
        coverImage: editorState.coverImageId ? { id: editorState.coverImageId } : null,
        authorId: editorState.authorId || null,
        status: editorState.status,
      } satisfies Partial<StudioPostDetail> & { title: string; status: "draft" | "published" };

      const method = editorState.id ? "PUT" : "POST";
      const endpoint = editorState.id ? `/api/studio/blog-posts/${editorState.id}` : "/api/studio/blog-posts";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error((errorPayload as { error?: string }).error ?? "Unable to save the post");
      }

      await fetchPosts();
      closeEditor();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setBanner(message);
    } finally {
      setEditorLoading(false);
    }
  };

  const statusCounts = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        acc[post.status] += 1;
        return acc;
      },
      { draft: 0, published: 0 } as { draft: number; published: number },
    );
  }, [posts]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const navItems: Array<{ label: string; value: "all" | "published" | "draft"; count: number }> = [
    { label: "All entries", value: "all", count: posts.length },
    { label: "Published", value: "published", count: statusCounts.published },
    { label: "Drafts", value: "draft", count: statusCounts.draft },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),transparent_45%)]"
      />
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-12 lg:grid lg:grid-cols-[300px,1fr] lg:gap-12 lg:px-12">
        <aside className="flex flex-col gap-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-emerald-500/20 backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Grounded Studio</p>
            <h1 className="text-2xl font-semibold text-white">Editorial command center</h1>
            <p className="text-sm text-slate-300/90">Manage every ritual, draft, and launch from a single calm workspace.</p>
          </div>
          <nav className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value)}
                aria-pressed={statusFilter === item.value}
                className={cn(
                  "group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                  statusFilter === item.value
                    ? "border-emerald-400/70 bg-emerald-500/15 text-white shadow-xl shadow-emerald-500/30"
                    : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-emerald-400/60 hover:bg-emerald-500/10 hover:text-white",
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    statusFilter === item.value
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "bg-white/[0.06] text-slate-300",
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex flex-col gap-8">
          <Card className="border-white/10 !bg-white/[0.03] text-slate-100 backdrop-blur-xl">
            <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl text-white">Editorial calendar</CardTitle>
                <CardDescription className="text-sm text-slate-300">
                  Track every post from rough outline to published ritual without leaving the studio.
                </CardDescription>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, slug, or excerpt"
                  leadingIcon={<Search className="h-4 w-4" />}
                  wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                  className="text-slate-100 placeholder:text-slate-400"
                />
                <Button type="button" className="whitespace-nowrap" size="lg" onClick={openEditorForNew}>
                  <Plus className="h-4 w-4" />
                  New post
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-slate-300">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  Loading entries…
                </div>
              ) : error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 px-8 text-center text-sm text-rose-200">
                  <p>{error}</p>
                  <Button type="button" variant="secondary" onClick={() => void fetchPosts()}>
                    Retry
                  </Button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 px-8 text-center text-sm text-slate-300">
                  <p>No posts match this filter yet. Create something beautiful.</p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="-mx-6 overflow-x-auto px-6">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                          <th className="py-3 pr-6">Title</th>
                          <th className="py-3 pr-6">Status</th>
                          <th className="py-3 pr-6">Slug</th>
                          <th className="py-3 pr-6">Updated</th>
                          <th className="py-3">Published</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPosts.map((post) => (
                          <tr
                            key={post.id}
                            onClick={() => void openEditorForExisting(post.id)}
                            className="group cursor-pointer border-b border-white/[0.05] transition hover:bg-white/[0.05]"
                          >
                            <td className="py-4 pr-6 align-top">
                              <div className="font-medium text-white">{post.title}</div>
                              {post.excerpt ? (
                                <p className="mt-1 text-xs text-slate-400">{post.excerpt}</p>
                              ) : null}
                            </td>
                            <td className="py-4 pr-6 align-top">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                  post.status === "published"
                                    ? "!border-emerald-500/50 !bg-emerald-500/15 !text-emerald-100"
                                    : "!border-amber-400/50 !bg-amber-500/10 !text-amber-200",
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    post.status === "published" ? "bg-emerald-400" : "bg-amber-400",
                                  )}
                                />
                                {post.status === "published" ? "Published" : "Draft"}
                              </Badge>
                            </td>
                            <td className="py-4 pr-6 align-top text-slate-300">{post.slug ?? "—"}</td>
                            <td className="py-4 pr-6 align-top text-slate-300">{formatDate(post.updatedAt)}</td>
                            <td className="py-4 align-top text-slate-300">
                              {formatDate(post.datePublished ?? post.publishedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {editorOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur"
              role="dialog"
              aria-modal="true"
            >
              <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
                <div className="flex items-start justify-between border-b border-white/10 px-8 py-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold text-white">
                      {editorState.id ? "Edit blog post" : "Create blog post"}
                    </h3>
                    <p className="text-sm text-slate-300/90">
                      Craft your story, connect assets, and publish directly to Contentful.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl border border-white/10 text-slate-300 hover:border-white/40 hover:text-white"
                    onClick={closeEditor}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {editorLoading ? (
                  <div className="flex h-72 flex-col items-center justify-center gap-3 text-sm text-slate-300">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                    Preparing form…
                  </div>
                ) : (
                  <form
                    className="grid gap-6 px-8 pb-8"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleSubmit();
                    }}
                  >
                    {banner ? (
                      <div
                        role="alert"
                        className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                      >
                        {banner}
                      </div>
                    ) : null}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="post-title" className="text-slate-200">
                          Title
                        </Label>
                        <Input
                          id="post-title"
                          value={editorState.title}
                          onChange={handleFieldChange("title")}
                          placeholder="Grounding breathwork ritual"
                          required
                          disabled={editorLoading}
                          wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                          className="text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="post-slug" className="text-slate-200">
                          Slug
                        </Label>
                        <Input
                          id="post-slug"
                          value={editorState.slug}
                          onChange={handleFieldChange("slug")}
                          placeholder="grounding-breathwork-ritual"
                          disabled={editorLoading}
                          wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                          className="text-slate-100 placeholder:text-slate-400"
                        />
                        <p className="text-xs text-slate-400">
                          Leave blank to have Contentful generate one automatically.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="post-excerpt" className="text-slate-200">
                          Excerpt
                        </Label>
                        <Textarea
                          id="post-excerpt"
                          value={editorState.excerpt}
                          onChange={handleFieldChange("excerpt")}
                          placeholder="A soothing practice to return to the body in under five minutes."
                          disabled={editorLoading}
                          className="border-white/10 bg-white/[0.05] text-sm text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="post-seo" className="text-slate-200">
                          SEO description
                        </Label>
                        <Textarea
                          id="post-seo"
                          value={editorState.seoDescription}
                          onChange={handleFieldChange("seoDescription")}
                          placeholder="One sentence that invites readers from Google or social feeds."
                          disabled={editorLoading}
                          className="border-white/10 bg-white/[0.05] text-sm text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="post-content" className="text-slate-200">
                        Article body
                      </Label>
                      <Textarea
                        id="post-content"
                        value={editorState.content}
                        onChange={handleFieldChange("content")}
                        placeholder="Write in plain text. Paragraphs are separated with an empty line."
                        required
                        disabled={editorLoading}
                        className="min-h-[200px] border-white/10 bg-white/[0.05] text-sm text-slate-100 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="post-date" className="text-slate-200">
                          Date published
                        </Label>
                        <Input
                          id="post-date"
                          type="datetime-local"
                          value={editorState.datePublished}
                          onChange={handleFieldChange("datePublished")}
                          disabled={editorLoading}
                          wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                          className="text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="post-author" className="text-slate-200">
                          Author entry ID
                        </Label>
                        <Input
                          id="post-author"
                          value={editorState.authorId}
                          onChange={handleFieldChange("authorId")}
                          placeholder="Optional — Contentful author entry ID"
                          disabled={editorLoading}
                          wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                          className="text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="post-cover" className="text-slate-200">
                          Cover image asset ID
                        </Label>
                        <Input
                          id="post-cover"
                          value={editorState.coverImageId}
                          onChange={handleFieldChange("coverImageId")}
                          placeholder="Optional — Contentful asset ID"
                          disabled={editorLoading}
                          wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                          className="text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="post-status" className="text-slate-200">
                          Workflow status
                        </Label>
                        <Select
                          id="post-status"
                          value={editorState.status}
                          onChange={handleFieldChange("status")}
                          disabled={editorLoading}
                          className="rounded-2xl border-white/10 bg-white/[0.05] text-slate-100"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pb-2 pt-1 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
                        onClick={closeEditor}
                        disabled={editorLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="justify-center rounded-2xl"
                        loading={editorLoading}
                      >
                        {!editorLoading ? <FileText className="h-4 w-4" /> : null}
                        {editorState.id ? "Update post" : "Save post"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
