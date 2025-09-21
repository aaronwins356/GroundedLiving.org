import page from "./schemas/page";
import post from "./schemas/post";

function getEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`Missing ${name} environment variable for Sanity configuration. Using fallback value.`);
  }
  return value ?? fallback;
}

const sanityConfig = {
  basePath: "/studio",
  title: "Grounded Living CMS",
  projectId: getEnv("SANITY_PROJECT_ID", "local"),
  dataset: getEnv("SANITY_DATASET", "development"),
  schema: {
    types: [post, page],
  },
  deskStructure: [
    { type: "post", title: "Posts" },
    { type: "page", title: "Pages" },
  ],
};

export default sanityConfig;
