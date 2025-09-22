import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

/**
 * Supports both legacy and NEXT_PUBLIC env names so the URL builder works locally and on Vercel.
 */
const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET;

const builder = projectId && dataset ? imageUrlBuilder({ projectId, dataset }) : null;

type ImageUrlBuilderApi = {
  width: (value: number) => ImageUrlBuilderApi;
  height: (value: number) => ImageUrlBuilderApi;
  fit: (value: string) => ImageUrlBuilderApi;
  auto: (value: string) => ImageUrlBuilderApi;
  url: () => string;
};

export type SanityImageWithAlt = (SanityImageSource & {
  alt?: string | null;
}) & {
  asset?: {
    _ref?: string;
    _id?: string;
  };
};

const fallbackBuilder: ImageUrlBuilderApi = {
  width: () => fallbackBuilder,
  height: () => fallbackBuilder,
  fit: () => fallbackBuilder,
  auto: () => fallbackBuilder,
  url: () => "/og-image.svg",
};

export function hasSanityImageAsset(
  image?: SanityImageWithAlt | null,
): image is SanityImageWithAlt & { asset: { _ref: string } } {
  return Boolean(image?.asset && typeof image.asset._ref === "string");
}

export function urlForImage(image: SanityImageWithAlt): ImageUrlBuilderApi {
  if (!builder || !hasSanityImageAsset(image)) {
    return fallbackBuilder;
  }

  return builder.image(image) as unknown as ImageUrlBuilderApi;
}
