import type { MetadataRoute } from "next";

import { canonicalFor } from "@/lib/seo/meta";

export function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: canonicalFor("/sitemap.xml").toString(),
  };
}

export default robots;
