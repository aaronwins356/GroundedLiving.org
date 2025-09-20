import createImageUrlBuilder from "@sanity/image-url";

import { sanityConfig } from "./sanity.client";
import type { SanityImage } from "./sanity.queries";

const builder = createImageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

export function urlForImage(source: SanityImage) {
  return builder.image(source as Parameters<typeof builder.image>[0]);
}
