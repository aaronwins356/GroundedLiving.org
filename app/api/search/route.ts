import { NextResponse } from "next/server";

import {
  buildSearchIndex,
  getCachedIndex,
  searchIndexDocs,
  setCachedIndex,
} from "@/lib/search/index";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);

  try {
    let index = getCachedIndex();
    if (!index) {
      index = await buildSearchIndex();
      setCachedIndex(index);
    }

    const { results, total, page, limit, tookMs } = searchIndexDocs(index.docs, query, pageParam, limitParam);

    return NextResponse.json(
      {
        results,
        total,
        page,
        limit,
        tookMs,
        lastBuilt: index.lastBuilt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json(
      {
        error: "Search temporarily unavailable",
      },
      { status: 500 },
    );
  }
}
