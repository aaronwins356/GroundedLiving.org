import type { NextRequest } from "next/server";

import {
  revalidatePathWithMocks,
  revalidateTagWithMocks,
} from "../../../lib/revalidate/control";

export const runtime = "nodejs";

type SupportedType = "BlogPost" | "Page" | "Category";

interface RevalidatePayload {
  type?: SupportedType;
  slug?: string | null;
  event?: "publish" | "unpublish" | "update" | string;
}

function getSecret(): string | null {
  const secret = process.env.CONTENTFUL_REVALIDATE_SECRET;
  if (!secret) {
    console.error("CONTENTFUL_REVALIDATE_SECRET is not configured. Rejecting webhook.");
    return null;
  }
  return secret;
}

function getProvidedSecret(request: NextRequest): string | null {
  return request.headers.get("x-webhook-secret");
}

async function parsePayload(request: NextRequest): Promise<RevalidatePayload | null> {
  try {
    const json = (await request.json()) as RevalidatePayload;
    return json;
  } catch (error) {
    console.error("Failed to parse Contentful webhook payload", error);
    return null;
  }
}

function revalidateSitemap() {
  try {
    revalidatePathWithMocks("/sitemap.xml");
  } catch (error) {
    console.error("Failed to revalidate sitemap.xml", error);
  }
}

export async function POST(request: NextRequest) {
  const expectedSecret = getSecret();
  if (!expectedSecret) {
    return Response.json({ revalidated: false, error: "Missing secret" }, { status: 500 });
  }

  const providedSecret = getProvidedSecret(request);
  if (!providedSecret || providedSecret !== expectedSecret) {
    return Response.json({ revalidated: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await parsePayload(request);
  if (!payload) {
    return Response.json({ revalidated: false, error: "Invalid payload" }, { status: 400 });
  }

  const revalidatedPaths: string[] = [];
  revalidateTagWithMocks("search-index");
  revalidateSitemap();

  const slug = payload.slug?.replace(/^\/+/, "") ?? null;

  if (payload.type === "BlogPost" && slug) {
    const path = `/blog/${slug}`;
    revalidatePathWithMocks(path);
    revalidatedPaths.push(path);
  }

  if (payload.type === "Page" && slug) {
    const path = slug === "home" ? "/" : `/${slug}`;
    revalidatePathWithMocks(path);
    revalidatedPaths.push(path);
  }

  if (payload.type === "Category" && slug) {
    const categoryPath = `/blog/category/${slug}`;
    revalidatePathWithMocks(categoryPath);
    revalidatePathWithMocks("/blog");
    revalidatedPaths.push(categoryPath, "/blog");
  }

  return Response.json({ revalidated: true, event: payload.event ?? null, revalidatedPaths });
}
