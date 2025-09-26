import { NextResponse } from "next/server";

// The Contentful management SDK depends on Node APIs, so keep this handler on Node.
export const runtime = "nodejs";

import { createBlogPost, getBlogPosts } from "../../../../lib/contentfulManagement";
import { guardRequest, handleError, parsePagination } from "../utils";

export async function GET(request: Request) {
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { skip, limit, search } = parsePagination(request);
    const posts = await getBlogPosts({ skip, limit, search });
    return NextResponse.json(posts);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as Parameters<typeof createBlogPost>[0];
    const created = await createBlogPost(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
