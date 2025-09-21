import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

import page from "./schemas/page";
import post from "./schemas/post";

function readEnv(name: string, fallback?: string) {
  const legacy = process.env[name];
  const nextPublic = process.env[`NEXT_PUBLIC_${name}`];
  const value = legacy || nextPublic;

  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`Missing ${name} (or NEXT_PUBLIC_${name}) for Sanity configuration. Using fallback value.`);
  }

  return value || fallback || "";
}

const projectId = readEnv("SANITY_PROJECT_ID");
const dataset = readEnv("SANITY_DATASET", "production");

export default defineConfig({
  /** Expose the embedded Studio at /studio so Vercel deployments remain self-contained. */
  basePath: "/studio",
  name: "grounded_living_studio",
  title: "Grounded Living Studio",
  projectId,
  dataset,
  schema: {
    types: [post, page],
  },
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title("Create content")
          .items([
            S.listItem().title("Posts").schemaType("post").child(S.documentTypeList("post").title("Posts")),
            S.listItem().title("Pages").schemaType("page").child(S.documentTypeList("page").title("Pages")),
          ]),
    }),
  ],
  document: {
    newDocumentOptions: (prev) => prev.filter((template) => ["page", "post"].includes(template.templateId)),
  },
});
