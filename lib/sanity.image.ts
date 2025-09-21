const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;

type ImageUrlParams = {
  w?: number;
  h?: number;
  fit?: string;
  auto?: string;
};

export type SanityImageWithAlt = {
  _key?: string;
  alt?: string;
  asset?: {
    _ref?: string;
  };
};

type ImageUrlBuilderApi = {
  width: (value: number) => ImageUrlBuilderApi;
  height: (value: number) => ImageUrlBuilderApi;
  fit: (value: string) => ImageUrlBuilderApi;
  auto: (value: string) => ImageUrlBuilderApi;
  url: () => string;
};

function buildBaseUrl(ref: string | undefined): string | null {
  if (!projectId || !dataset || !ref) {
    return null;
  }

  const match = ref.match(/^image-([a-zA-Z0-9-]+)-\d+x\d+-([a-zA-Z0-9]+)/);
  if (!match) {
    return null;
  }

  const [, id, format] = match;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${format}`;
}

function createBuilder(ref: string | undefined): ImageUrlBuilderApi {
  const params: ImageUrlParams = {};

  const builder: ImageUrlBuilderApi = {
    width(value) {
      params.w = value;
      return builder;
    },
    height(value) {
      params.h = value;
      return builder;
    },
    fit(value) {
      params.fit = value;
      return builder;
    },
    auto(value) {
      params.auto = value;
      return builder;
    },
    url() {
      const baseUrl = buildBaseUrl(ref);
      if (!baseUrl) {
        return "/og-image.svg";
      }

      const searchParams = new URLSearchParams();
      if (params.w) {
        searchParams.set("w", String(params.w));
      }
      if (params.h) {
        searchParams.set("h", String(params.h));
      }
      if (params.fit) {
        searchParams.set("fit", params.fit);
      }
      if (params.auto) {
        searchParams.set("auto", params.auto);
      }

      const query = searchParams.toString();
      return query ? `${baseUrl}?${query}` : baseUrl;
    },
  };

  return builder;
}

export function hasSanityImageAsset(image?: SanityImageWithAlt | null): image is SanityImageWithAlt & {
  asset: { _ref: string };
} {
  return Boolean(image?.asset?._ref);
}

export function urlForImage(image: SanityImageWithAlt): ImageUrlBuilderApi {
  return createBuilder(image.asset?._ref);
}
