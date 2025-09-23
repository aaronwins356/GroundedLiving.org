import { createClient } from "contentful-management";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENV_ID = process.env.CONTENTFUL_ENVIRONMENT || "master";
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

async function purge() {
  const client = createClient({ accessToken: TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  // delete entries
  const entries = await env.getEntries();
  for (const entry of entries.items) {
    if (entry.isPublished()) await entry.unpublish();
    await entry.delete();
    console.log("Deleted entry:", entry.sys.id);
  }

  // delete assets
  const assets = await env.getAssets();
  for (const asset of assets.items) {
    if (asset.isPublished()) await asset.unpublish();
    await asset.delete();
    console.log("Deleted asset:", asset.sys.id);
  }

  // delete content types
  const contentTypes = await env.getContentTypes();
  for (const ct of contentTypes.items) {
    if (ct.isPublished()) await ct.unpublish();
    await ct.delete();
    console.log("Deleted content type:", ct.sys.id);
  }

  console.log("✅ Space purged successfully");
}

purge().catch((err) => {
  console.error("Purge failed", err);
  process.exit(1);
});
