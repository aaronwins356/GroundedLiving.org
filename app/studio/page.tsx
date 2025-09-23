import { cookies } from "next/headers";

import type { PaginatedResponse, BlogPostSummary, PageSummary, AuthorDetail } from "../../lib/contentfulManagement";
import { getAuthors, getBlogPosts, getPages } from "../../lib/contentfulManagement";
import { LoginForm } from "./login-form";
import { PAGE_SIZE, STUDIO_COOKIE_NAME } from "./constants";
import { getExpectedHash } from "./security";
import { StudioApp } from "./studio-app";

function emptyResponse<T>(): PaginatedResponse<T> {
  return {
    items: [],
    total: 0,
    skip: 0,
    limit: PAGE_SIZE,
  } satisfies PaginatedResponse<T>;
}

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const expectedHash = getExpectedHash();
  const session = (await cookies()).get(STUDIO_COOKIE_NAME)?.value;
  const isAuthenticated = expectedHash && session === expectedHash;

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const [posts, pages, authors] = await Promise.all([
    getBlogPosts({ skip: 0, limit: PAGE_SIZE }).catch(() => emptyResponse<BlogPostSummary>()),
    getPages({ skip: 0, limit: PAGE_SIZE }).catch(() => emptyResponse<PageSummary>()),
    getAuthors({ skip: 0, limit: PAGE_SIZE }).catch(() => emptyResponse<AuthorDetail>()),
  ]);

  return <StudioApp initialPosts={posts} initialPages={pages} initialAuthors={authors} />;
}
