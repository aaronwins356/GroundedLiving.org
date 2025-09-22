import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type RevalidatePayload = {
  secret?: string;
  tag?: string;
  tags?: string[];
};

function getSecret(): string | null {
  const secret = process.env.PRISMIC_REVALIDATE_SECRET;
  if (!secret) {
    console.warn("PRISMIC_REVALIDATE_SECRET is not set. Revalidation requests will be ignored.");
    return null;
  }
  return secret;
}

function authorize(request: NextRequest, expectedSecret: string, bodySecret?: string | null): boolean {
  const urlSecret = request.nextUrl.searchParams.get("secret");
  return (bodySecret ?? urlSecret) === expectedSecret;
}

function revalidate(tags: string[]) {
  tags.forEach((tag) => {
    if (tag) {
      revalidateTag(tag);
    }
  });
}

async function parsePayload(request: NextRequest): Promise<RevalidatePayload | null> {
  if (request.method !== "POST") {
    return {
      secret: request.nextUrl.searchParams.get("secret") ?? undefined,
      tag: request.nextUrl.searchParams.get("tag") ?? undefined,
    };
  }

  try {
    const json = (await request.json()) as RevalidatePayload;
    return json;
  } catch (error) {
    console.warn("Failed to parse revalidate payload", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const secret = getSecret();
  if (!secret) {
    return NextResponse.json({ message: "Missing PRISMIC_REVALIDATE_SECRET" }, { status: 500 });
  }

  const payload = await parsePayload(request);
  if (!payload || !authorize(request, secret, payload.secret)) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const tags = Array.isArray(payload.tags) && payload.tags.length > 0 ? payload.tags : [payload.tag ?? "prismic"];
  revalidate(tags);

  return NextResponse.json({ revalidated: true, tags });
}

export async function GET(request: NextRequest) {
  const secret = getSecret();
  if (!secret) {
    return NextResponse.json({ message: "Missing PRISMIC_REVALIDATE_SECRET" }, { status: 500 });
  }

  const payload = await parsePayload(request);
  if (!payload || !authorize(request, secret, payload.secret)) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const tag = payload.tag ?? "prismic";
  revalidate([tag]);

  return NextResponse.json({ revalidated: true, tags: [tag] });
}
