import createImageUrlBuilder from "@sanity/image-url";

import { sanityConfig } from "./sanity.client";
import type { PortableTextImage, SanityImageAsset } from "../types/post";

const builder = createImageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

export function urlForImage(source: SanityImageAsset | PortableTextImage) {
  return builder.image(source as Parameters<typeof builder.image>[0]);
}
