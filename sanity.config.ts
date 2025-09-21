import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

import page from "./schemas/page";
import post from "./schemas/post";

// Allow the Studio to boot even if only legacy environment variables are set, but surface clear warnings for developers.
function readEnv(primary: string, fallback?: string, legacy?: string) {
  const value = process.env[primary] || (legacy ? process.env[legacy] : undefined);

  if (!value && process.env.NODE_ENV !== "production") {
    const message = legacy
      ? `Missing ${primary} (or legacy ${legacy}) for Sanity configuration. Using fallback value.`
      : `Missing ${primary} for Sanity configuration. Using fallback value.`;
    console.warn(message);
  }

  if (!process.env[primary] && legacy && process.env[legacy] && process.env.NODE_ENV !== "production") {
    console.warn(`Using legacy ${legacy}. Please rename it to ${primary}.`);
  }

  return value || fallback || "";
}

const projectId = readEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", undefined, "SANITY_PROJECT_ID");
const dataset = readEnv("NEXT_PUBLIC_SANITY_DATASET", "production", "SANITY_DATASET");

export default defineConfig({
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
