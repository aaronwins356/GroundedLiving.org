export interface ImageUrlBuilderInstance {
  width(width: number): ImageUrlBuilderInstance;
  height(height: number): ImageUrlBuilderInstance;
  fit(value: string): ImageUrlBuilderInstance;
  auto(value: string): ImageUrlBuilderInstance;
  url(): string;
}

export interface ImageUrlBuilder {
  image(source: unknown): ImageUrlBuilderInstance;
}

export default function createImageUrlBuilder(config: {
  projectId: string;
  dataset: string;
}): ImageUrlBuilder;
