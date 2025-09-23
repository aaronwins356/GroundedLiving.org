import { NextResponse } from "next/server";

import { deletePage, getPage, updatePage } from "../../../../../lib/contentfulManagement";
import { guardRequest, handleError } from "../../utils";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const page = await getPage(params.id);
    return NextResponse.json(page);
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
    const payload = (await request.json()) as Parameters<typeof updatePage>[1];
    const updated = await updatePage(params.id, payload);
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
    await deletePage(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
