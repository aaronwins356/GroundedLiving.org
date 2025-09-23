import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getExpectedHash } from "../../studio/security";
import { STUDIO_COOKIE_NAME } from "../../studio/constants";

export async function guardRequest(): Promise<NextResponse | null> {
  const expectedHash = getExpectedHash();
  const session = (await cookies()).get(STUDIO_COOKIE_NAME)?.value;

  if (!expectedHash || !session || session !== expectedHash) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export function parsePagination(request: Request) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "10", 10);
  const search = url.searchParams.get("search") ?? undefined;

  return {
    skip: page > 1 ? (page - 1) * pageSize : 0,
    limit: pageSize,
    search,
  };
}

export function handleError(error: unknown) {
  console.error("Studio API error", error);
  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}
