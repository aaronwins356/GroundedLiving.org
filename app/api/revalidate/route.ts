import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { contentfulTags } from "@/lib/contentful";

const SECRET = process.env.CONTENTFUL_REVALIDATE_SECRET;

type RevalidatePayload = {
  secret?: string;
  tags?: string[];
  paths?: string[];
  slug?: string;
  type?: string;
};

function validateSecret(candidate?: string | null) {
  if (!SECRET) {
    console.warn("CONTENTFUL_REVALIDATE_SECRET is not configured. Skipping revalidation.");
    return false;
  }
  return candidate === SECRET;
}

const tagLookup = new Map<string, string>(
  Object.entries(contentfulTags).map(([key, value]) => [key, value]),
);

function resolveTag(tag: string) {
  return tagLookup.get(tag) ?? tag;
}

function triggerTags(tags: string[] = []) {
  tags.forEach((tag) => {
    const resolved = resolveTag(tag);
    if (resolved) {
      revalidateTag(resolved);
    }
  });
}

function triggerPaths(paths: string[] = []) {
  paths.forEach((path) => {
    if (path) {
      revalidatePath(path);
    }
  });
}

async function parseRequest(request: NextRequest): Promise<RevalidatePayload | null> {
  if (request.method !== "POST") {
    return {
      secret: request.nextUrl.searchParams.get("secret") ?? undefined,
      slug: request.nextUrl.searchParams.get("slug") ?? undefined,
      type: request.nextUrl.searchParams.get("type") ?? undefined,
    };
  }

  try {
    const json = (await request.json()) as RevalidatePayload;
    return json;
  } catch (error) {
    console.warn("Failed to parse Contentful revalidate payload", error);
    return null;
  }
}

function inferPathsFromPayload(payload: RevalidatePayload): string[] {
  const paths = new Set<string>();
  if (payload.paths) {
    payload.paths.forEach((path) => path && paths.add(path));
  }
  if (payload.slug) {
    if (payload.type === "post") {
      paths.add(`/blog/${payload.slug}`);
      paths.add("/");
      paths.add("/blog");
    }
    if (payload.type === "page") {
      paths.add(`/pages/${payload.slug}`);
    }
    if (payload.type === "category") {
      paths.add(`/categories/${payload.slug}`);
    }
  }
  return Array.from(paths);
}

export async function POST(request: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ message: "CONTENTFUL_REVALIDATE_SECRET is not configured" }, { status: 500 });
  }

  const payload = await parseRequest(request);
  if (!payload || !validateSecret(payload.secret ?? request.nextUrl.searchParams.get("secret"))) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const tags = payload.tags ?? ["posts", "pages", "categories"];
  const paths = inferPathsFromPayload(payload);

  triggerTags(tags);
  triggerPaths(paths);

  return NextResponse.json({ revalidated: true, tags, paths });
}

export async function GET(request: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ message: "CONTENTFUL_REVALIDATE_SECRET is not configured" }, { status: 500 });
  }

  const payload = await parseRequest(request);
  if (!payload || !validateSecret(payload.secret ?? request.nextUrl.searchParams.get("secret"))) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const paths = inferPathsFromPayload(payload);
  triggerTags(["posts", "pages", "categories"]);
  triggerPaths(paths);

  return NextResponse.json({ revalidated: true, paths });
}
