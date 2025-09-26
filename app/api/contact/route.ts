import { NextRequest, NextResponse } from "next/server";

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const RATE_LIMIT_MAX_TOKENS = 5;
const RATE_LIMIT_REFILL_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_REFILL_TOKENS = RATE_LIMIT_MAX_TOKENS;

const buckets = new Map<string, RateLimitBucket>();

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function takeToken(identifier: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(identifier) ?? {
    tokens: RATE_LIMIT_MAX_TOKENS,
    lastRefill: now,
  };

  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const tokensToAdd = Math.floor((elapsed / RATE_LIMIT_REFILL_WINDOW) * RATE_LIMIT_REFILL_TOKENS);
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(RATE_LIMIT_MAX_TOKENS, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  if (bucket.tokens <= 0) {
    buckets.set(identifier, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(identifier, bucket);
  return true;
}

function validatePayload(payload: ContactPayload) {
  const errors: Record<string, string> = {};
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name) {
    errors.name = "Please share your name.";
  }

  if (!email) {
    errors.email = "An email address helps us respond.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!message) {
    errors.message = "Let us know how we can help.";
  }

  return { errors, name, email, message };
}

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  if (!takeToken(identifier)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch (error) {
    console.error("Invalid contact payload", error);
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const { errors, name, email, message } = validatePayload(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  console.info("Contact form submission", {
    name,
    email,
    message,
  });

  return NextResponse.json({ ok: true });
}
