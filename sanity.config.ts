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
  deskStructure: {
    title: "Grounded Living content",
    description:
      "Start with Posts for new journal entries or Pages for evergreen content like About and Contact. These groups stay pinned at the top so editors never lose track of them.",
    sections: [
      {
        type: "post",
        title: "Posts",
        helpText: "Write, schedule, and publish new Grounded Living stories.",
      },
      {
        type: "page",
        title: "Pages",
        helpText: "Update evergreen pages (About, Contact, Services) that appear in site navigation.",
      },
    ],
    // This structure data is consumed by the hosted studio embed to render quick links for editors.
  },
};

export default sanityConfig;
