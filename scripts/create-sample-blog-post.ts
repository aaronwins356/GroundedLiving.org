import { createClient } from "contentful-management";

import type { RichTextDocument } from "@project-types/contentful";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const DEFAULT_LOCALE = process.env.CONTENTFUL_DEFAULT_LOCALE ?? "en-US";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing Contentful credentials. Please configure CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN.");
  process.exit(1);
}

async function main() {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN as string });
  const space = await client.getSpace(SPACE_ID as string);
  const environment = await space.getEnvironment(ENVIRONMENT_ID);

  const now = new Date();
  const slug = `grounded-sample-post-${now.getTime()}`;
  const richText: RichTextDocument = {
    nodeType: "document",
    content: [
      {
        nodeType: "paragraph",
        content: [
          {
            nodeType: "text",
            value:
              "Welcome to your Contentful-powered blog. Edit this post inside the Studio dashboard or delete it once you've published your own stories.",
            marks: [],
          },
        ],
      },
    ],
  };

  const entry = await environment.createEntry("blogPost", {
    fields: {
      title: { [DEFAULT_LOCALE]: "Grounded Living sample post" },
      slug: { [DEFAULT_LOCALE]: slug },
      excerpt: { [DEFAULT_LOCALE]: "A quick hello from the migration script to verify your credentials." },
      content: { [DEFAULT_LOCALE]: richText },
      "date-published": { [DEFAULT_LOCALE]: now.toISOString() },
      "seo-description": {
        [DEFAULT_LOCALE]: "Grounded Living sample entry created by the migration smoke test.",
      },
    },
  });

  const published = await entry.publish();
  console.log(`Created blogPost entry ${published.sys.id} with slug ${slug}`);
}

main().catch((error) => {
  console.error("Failed to seed sample blog post", error);
  process.exit(1);
});
