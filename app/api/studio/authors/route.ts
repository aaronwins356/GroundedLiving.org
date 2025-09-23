import { NextResponse } from "next/server";

import { createAuthor, getAuthors } from "../../../../lib/contentfulManagement";
import { guardRequest, handleError, parsePagination } from "../utils";

export async function GET(request: Request) {
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { skip, limit, search } = parsePagination(request);
    const authors = await getAuthors({ skip, limit, search });
    return NextResponse.json(authors);
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
    const payload = (await request.json()) as Parameters<typeof createAuthor>[0];
    const created = await createAuthor(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
