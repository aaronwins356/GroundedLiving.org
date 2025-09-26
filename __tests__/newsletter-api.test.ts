import assert from "node:assert/strict";

import { POST as newsletterHandler } from "../app/api/newsletter/route";
import { clearNewsletterRateLimit } from "../lib/newsletter/rateLimit";

type TestCase = { name: string; fn: () => Promise<void> | void };

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function resetEnvironment() {
  Object.assign(process.env, originalEnv);
  global.fetch = originalFetch;
  clearNewsletterRateLimit();
}

function prepareDefaults() {
  clearNewsletterRateLimit();
  process.env.NEWSLETTER_PROVIDER = "custom";
  process.env.NEWSLETTER_API_KEY = "test-key";
  process.env.NEWSLETTER_LIST_ID = "test-list";
  process.env.NEWSLETTER_DOUBLE_OPT_IN = "true";
  global.fetch = originalFetch;
}

function createRequest(body: unknown, ip?: string): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (ip) {
    headers.set("x-forwarded-for", ip);
  }
  return new Request("https://groundedliving.org/api/newsletter", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function invokeNewsletter(request: Request): Promise<Response> {
  const headers = new Headers(request.headers);
  if (!headers.has("x-forwarded-for")) {
    headers.set("x-forwarded-for", "127.0.0.1");
  }

  const stub = {
    headers,
    json: () => request.json(),
  } as unknown as import("next/server").NextRequest;

  return newsletterHandler(stub);
}

export const newsletterApiTests: TestCase[] = [
  {
    name: "rejects invalid email addresses",
    async fn() {
      prepareDefaults();
      const response = await invokeNewsletter(createRequest({ email: "invalid-email" }));
      assert.equal(response.status, 400);
      const json = await response.json();
      assert.equal(json.ok, false);
    },
  },
  {
    name: "subscribes via MailerLite",
    async fn() {
      prepareDefaults();
      process.env.NEWSLETTER_PROVIDER = "mailerlite";
      process.env.NEWSLETTER_DOUBLE_OPT_IN = "false";

      let captured: Record<string, unknown> | null = null;
      global.fetch = async (_input, init) => {
        captured = init ? JSON.parse((init as RequestInit).body as string) : null;
        return new Response(JSON.stringify({ id: "123" }), { status: 200 });
      };

      const response = await invokeNewsletter(createRequest({ email: "hello@example.com", tag: "test", source: "unit" }));
      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.ok, true);
      if (!captured) {
        throw new Error("Expected MailerLite payload to be captured");
      }

      const typed = captured as {
        email?: string;
        groups?: unknown;
        status?: string;
      };

      assert.equal(typed.email, "hello@example.com");
      assert.deepEqual(typed.groups, ["test-list"]);
      assert.equal(typed.status, "active");
    },
  },
  {
    name: "returns 502 when provider fails",
    async fn() {
      prepareDefaults();
      process.env.NEWSLETTER_PROVIDER = "beehiiv";
      global.fetch = async () => new Response("oops", { status: 500 });

      const response = await invokeNewsletter(createRequest({ email: "fail@example.com" }));
      assert.equal(response.status, 502);
      const json = await response.json();
      assert.equal(json.ok, false);
    },
  },
  {
    name: "rate limits repeated submissions",
    async fn() {
      prepareDefaults();
      let last: Response | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        last = await invokeNewsletter(createRequest({ email: "limit@example.com" }, "192.0.2.1"));
      }

      assert.ok(last);
      assert.equal(last?.status, 429);
    },
  },
];

resetEnvironment();
