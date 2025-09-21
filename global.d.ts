declare module "some-other-lib";

declare module "next" {
  // Provide the PageProps helper introduced in newer Next.js versions so older builds can extend it safely.
  export interface PageProps {
    params?: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }

  export { Metadata, MetadataRoute } from "next/types";
}
