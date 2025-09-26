import { NextResponse } from "next/server";

// The Contentful management SDK depends on Node APIs, so keep this handler on Node.
export const runtime = "nodejs";

import { deleteAuthor, getAuthor, updateAuthor } from "../../../../../lib/contentfulManagement";
import { guardRequest, handleError } from "../../utils";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const author = await getAuthor(params.id);
    return NextResponse.json(author);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as Parameters<typeof updateAuthor>[1];
    const updated = await updateAuthor(params.id, payload);
    return NextResponse.json(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await deleteAuthor(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
