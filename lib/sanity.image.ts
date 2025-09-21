import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "";

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
