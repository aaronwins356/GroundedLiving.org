import type { NextRequest } from "next/server";

import { isRateLimited } from "../../../lib/newsletter/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return fallback;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first) {
      return first.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "anonymous";
}


function normalizeProvider(value: string | undefined): string {
  return (value ?? "custom").toLowerCase();
}

interface SubscribePayload {
  email: string;
  tag?: string;
  source?: string;
}

async function subscribeMailerLite(payload: SubscribePayload, doubleOptIn: boolean) {
  const apiKey = process.env.NEWSLETTER_API_KEY;
  const listId = process.env.NEWSLETTER_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error("Mailerlite API configuration is incomplete");
  }

  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      fields: payload.source ? { source: payload.source } : undefined,
      groups: [listId],
      status: doubleOptIn ? "unconfirmed" : "active",
      ...(payload.tag ? { tags: [payload.tag] } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mailerlite request failed: ${response.status} ${errorBody}`);
  }
}

async function subscribeConvertKit(payload: SubscribePayload) {
  const apiKey = process.env.NEWSLETTER_API_KEY;
  const listId = process.env.NEWSLETTER_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error("ConvertKit API configuration is incomplete");
  }

  const endpoint = new URL(`https://api.convertkit.com/v3/forms/${listId}/subscribe`);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      api_secret: apiKey,
      ...(payload.tag ? { tags: [payload.tag] } : {}),
      ...(payload.source ? { source: payload.source } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ConvertKit request failed: ${response.status} ${errorBody}`);
  }
}

async function subscribeBeehiiv(payload: SubscribePayload, doubleOptIn: boolean) {
  const apiKey = process.env.NEWSLETTER_API_KEY;
  const listId = process.env.NEWSLETTER_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error("Beehiiv API configuration is incomplete");
  }

  const response = await fetch("https://api.beehiiv.com/v2/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      publication_id: listId,
      reactivate_existing: true,
      send_welcome_email: !doubleOptIn,
      ...(payload.source ? { utm_source: payload.source } : {}),
      ...(payload.tag ? { tags: [payload.tag] } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Beehiiv request failed: ${response.status} ${errorBody}`);
  }
}

async function recordCustomSubscription(payload: SubscribePayload) {
  console.info("Received custom newsletter subscription", payload);
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return Response.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  let json: SubscribePayload;
  try {
    json = (await request.json()) as SubscribePayload;
  } catch (error) {
    console.error("Failed to parse newsletter request body", error);
    return Response.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = json?.email?.trim();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return Response.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }

  const provider = normalizeProvider(process.env.NEWSLETTER_PROVIDER);
  const doubleOptIn = parseBoolean(process.env.NEWSLETTER_DOUBLE_OPT_IN, true);

  try {
    switch (provider) {
      case "mailerlite":
        await subscribeMailerLite({ email, tag: json.tag, source: json.source }, doubleOptIn);
        break;
      case "convertkit":
        await subscribeConvertKit({ email, tag: json.tag, source: json.source });
        break;
      case "beehiiv":
        await subscribeBeehiiv({ email, tag: json.tag, source: json.source }, doubleOptIn);
        break;
      case "resend-list":
      case "custom":
        await recordCustomSubscription({ email, tag: json.tag, source: json.source });
        break;
      default:
        console.warn(`Unsupported newsletter provider: ${provider}`);
        await recordCustomSubscription({ email, tag: json.tag, source: json.source });
        break;
    }
  } catch (error) {
    console.error(`Newsletter subscription failed for provider ${provider}`, error);
    return Response.json(
      {
        ok: false,
        error: "Subscription service is temporarily unavailable. Please try again soon.",
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}

