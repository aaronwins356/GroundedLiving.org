import assert from "node:assert/strict";

import { POST as revalidateHandler } from "../app/api/revalidate/route";
import { resetRevalidateMocks, setRevalidateMocks } from "../lib/revalidate/control";

type TestCase = { name: string; fn: () => Promise<void> | void };

const originalEnv = { ...process.env };

function resetEnvironment() {
  Object.assign(process.env, originalEnv);
  resetRevalidateMocks();
}

function createRequest(body: unknown, secret?: string) {
  const headers = new Headers({ "content-type": "application/json" });
  if (secret) {
    headers.set("x-webhook-secret", secret);
  }

  return {
    headers,
    json: async () => body,
    nextUrl: new URL("https://groundedliving.org/api/revalidate"),
  } as unknown as import("next/server").NextRequest;
}

export const revalidateApiTests: TestCase[] = [
  {
    name: "rejects requests with missing secrets",
    async fn() {
      process.env.CONTENTFUL_REVALIDATE_SECRET = "top-secret";
      const response = await revalidateHandler(createRequest({ type: "BlogPost", slug: "test" }));
      assert.equal(response.status, 401);
      const json = await response.json();
      assert.equal(json.revalidated, false);
    },
  },
  {
    name: "revalidates blog posts and sitemap",
    async fn() {
      process.env.CONTENTFUL_REVALIDATE_SECRET = "top-secret";
      const paths: string[] = [];
      const tags: string[] = [];

      setRevalidateMocks({
        revalidatePath: (path) => {
          paths.push(path);
        },
        revalidateTag: (tag) => {
          tags.push(tag);
        },
      });

      const response = await revalidateHandler(
        createRequest({ type: "BlogPost", slug: "evening-rituals", event: "publish" }, "top-secret"),
      );

      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.revalidated, true);
      assert.deepEqual(tags, ["search-index"]);
      assert.ok(paths.includes("/sitemap.xml"));
      assert.ok(paths.includes("/blog/evening-rituals"));
    },
  },
  {
    name: "revalidates pages and categories",
    async fn() {
      process.env.CONTENTFUL_REVALIDATE_SECRET = "top-secret";
      const paths: string[] = [];

      setRevalidateMocks({
        revalidatePath: (path) => {
          paths.push(path);
        },
        revalidateTag: () => undefined,
      });

      await revalidateHandler(createRequest({ type: "Page", slug: "about" }, "top-secret"));
      await revalidateHandler(createRequest({ type: "Category", slug: "rituals" }, "top-secret"));

      assert.ok(paths.includes("/about"));
      assert.ok(paths.includes("/blog/category/rituals"));
      assert.ok(paths.includes("/blog"));
    },
  },
];

resetEnvironment();
