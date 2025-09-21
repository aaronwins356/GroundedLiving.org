import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { sanityConfig } from "./sanity.client";

type ImageUrlBuilderApi = {
  width: (value: number) => ImageUrlBuilderApi;
  height: (value: number) => ImageUrlBuilderApi;
  fit: (value: string) => ImageUrlBuilderApi;
  auto: (value: string) => ImageUrlBuilderApi;
  url: () => string;
};

const hasCredentials = Boolean(sanityConfig.projectId && sanityConfig.dataset);

const builder = hasCredentials
  ? imageUrlBuilder({
      projectId: sanityConfig.projectId!,
      dataset: sanityConfig.dataset!,
    })
  : null;

const fallbackBuilder: ImageUrlBuilderApi = {
  width: () => fallbackBuilder,
  height: () => fallbackBuilder,
  fit: () => fallbackBuilder,
  auto: () => fallbackBuilder,
  url: () => "/og-image.svg",
};

export type SanityImageWithAlt = SanityImageSource & {
  alt?: string;
  asset?: {
    _ref?: string;
  };
};

export function hasSanityImageAsset(image?: SanityImageWithAlt | null): image is SanityImageWithAlt & {
  asset: { _ref: string };
} {
  return Boolean(image?.asset?._ref);
}

export function urlForImage(source: SanityImageSource): ImageUrlBuilderApi {
  if (builder) {
    return builder.image(source);
  }

  return fallbackBuilder;
}
