import { createHash } from "node:crypto";

export function computeHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedHash(): string | null {
  const key = process.env.STUDIO_ADMIN_KEY;
  if (!key) {
    console.warn("STUDIO_ADMIN_KEY is not configured. The /studio route cannot be secured until it is set.");
    return null;
  }
  return computeHash(key);
}
