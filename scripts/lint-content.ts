import fs from "node:fs/promises";
import path from "node:path";

import { LINK_MAP } from "../lib/internalLinks.ts";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

interface PostSeed {
  title?: string;
  description?: string;
  excerpt?: string;
  body?: string;
  content?: string;
  references?: unknown;
  disclosureNeeded?: boolean;
}

async function loadJsonPosts(): Promise<Array<{ file: string; data: PostSeed }>> {
  try {
    const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
    const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
    const posts = await Promise.all(
      jsonFiles.map(async (entry) => {
        const filePath = path.join(POSTS_DIR, entry.name);
        const raw = await fs.readFile(filePath, "utf8");
        try {
          const data = JSON.parse(raw) as PostSeed;
          return { file: filePath, data };
        } catch (error) {
          throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
        }
      }),
    );
    return posts;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function hasInternalLinkCandidate(seed: PostSeed): boolean {
  if (Array.isArray(seed.references) && seed.references.length > 0) {
    return true;
  }

  const textSources = [seed.title, seed.description, seed.excerpt, seed.body, seed.content]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" \n")
    .toLowerCase();

  return Object.keys(LINK_MAP).some((phrase) => textSources.includes(phrase));
}

function validatePost(file: string, seed: PostSeed): string[] {
  const errors: string[] = [];
  const title = typeof seed.title === "string" ? seed.title.trim() : "";
  if (!title) {
    errors.push("missing title");
  } else if (title.length > 65) {
    errors.push(`title exceeds 65 characters (${title.length})`);
  }

  const description =
    typeof seed.description === "string"
      ? seed.description.trim()
      : typeof seed.excerpt === "string"
        ? seed.excerpt.trim()
        : "";
  if (!description) {
    errors.push("missing description or excerpt");
  } else if (description.length > 160) {
    errors.push(`description exceeds 160 characters (${description.length})`);
  }

  if (typeof seed.disclosureNeeded !== "boolean") {
    errors.push("disclosureNeeded flag must be provided as a boolean");
  }

  if (!hasInternalLinkCandidate(seed)) {
    errors.push("no internal link candidate found (add references[] or include a LINK_MAP phrase)");
  }

  return errors.length ? [`${file}:`, ...errors.map((error) => `  - ${error}`)] : [];
}

async function main() {
  const posts = await loadJsonPosts();
  if (posts.length === 0) {
    console.info("lint:content", "No JSON posts found in content/posts; skipping seed checks.");
    return;
  }

  const failures = posts.flatMap(({ file, data }) => validatePost(file, data));
  if (failures.length > 0) {
    console.error("lint:content", "Found content issues:\n" + failures.join("\n"));
    process.exitCode = 1;
    return;
  }

  console.info("lint:content", `Checked ${posts.length} seeded posts — all good!`);
}

main().catch((error) => {
  console.error("lint:content", error);
  process.exit(1);
});
