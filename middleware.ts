import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import seoConfig from "./next-seo.config";

const canonicalUrlString = process.env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl;
const disableCanonicalRedirects =
  process.env.NEXT_DISABLE_CANONICAL_REDIRECTS === "true";
let canonicalUrl: URL | null = null;
try {
  canonicalUrl = new URL(canonicalUrlString);
} catch {
  canonicalUrl = null;
}

const canonicalHost = canonicalUrl?.host ?? null;
const canonicalProtocol = canonicalUrl?.protocol ?? null;

const LOCAL_HOST_PATTERNS = [/^localhost(:\d+)?$/i, /^127\.0\.0\.1(:\d+)?$/];

export function middleware(request: NextRequest) {
  if (disableCanonicalRedirects) {
    // Allow preview/testing flows to run without forcing the canonical domain.
    return NextResponse.next();
  }

  if (!canonicalHost) {
    return NextResponse.next();
  }

  const hostHeader = request.headers.get("host");
  if (!hostHeader) {
    return NextResponse.next();
  }

  const normalizedHost = hostHeader.toLowerCase();

  if (normalizedHost === canonicalHost.toLowerCase()) {
    return NextResponse.next();
  }

  if (LOCAL_HOST_PATTERNS.some((pattern) => pattern.test(normalizedHost))) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV !== "production" && !normalizedHost.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (canonicalProtocol) {
    url.protocol = canonicalProtocol;
  }
  url.host = canonicalHost;

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
