import type { SanityImage } from "./sanity.queries";

type ImageUrlBuilder = {
  width: (value: number) => ImageUrlBuilder;
  height: (value: number) => ImageUrlBuilder;
  fit: (value: string) => ImageUrlBuilder;
  auto: (value: string) => ImageUrlBuilder;
  url: () => string;
};

export function urlForImage(source: SanityImage): ImageUrlBuilder {
  const safeRef = source.asset?._ref ?? "placeholder";
  const builder: ImageUrlBuilder = {
    width: () => builder,
    height: () => builder,
    fit: () => builder,
    auto: () => builder,
    // Use a deterministic local path so builds remain stable without remote Sanity assets.
    url: () => `/og-image.svg?ref=${encodeURIComponent(safeRef)}`,
  };

  return builder;
}
