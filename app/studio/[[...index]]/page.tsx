import type { Metadata } from "next";
import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

export const metadata: Metadata = {
  title: "Studio",
};

export const runtime = "nodejs";
export const revalidate = 0;

// Rendering the embedded Sanity Studio inside the App Router keeps the CMS and frontend in one project.
export default function StudioPage() {
  return <NextStudio config={config} />;
}
