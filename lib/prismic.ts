import "server-only";

import { cache } from "react";

export type PrismicRichTextSpan = {
  start: number;
  end: number;
  type: string;
  data?: Record<string, unknown>;
};

export type PrismicRichTextBlock = {
  type: string;
  text?: string;
  spans?: PrismicRichTextSpan[];
  data?: Record<string, unknown>;
  url?: string;
  alt?: string | null;
  dimensions?: {
    width?: number;
    height?: number;
  };
};

export type PrismicImage = {
  url: string;
  alt?: string | null;
  width?: number;
  height?: number;
};

export type PageDocument = {
  id: string;
  uid: string;
  title: string;
  content: PrismicRichTextBlock[] | null;
  coverImage?: PrismicImage | null;
};

type PrismicRefResponse = {
  refs: Array<{
    id: string;
    ref: string;
    isMasterRef?: boolean;
  }>;
};

type PrismicSearchResponse<T> = {
  results: Array<PrismicDocument<T>>;
};

type PrismicDocument<T> = {
  id: string;
  uid: string | null;
  data: T;
};

type PageDocumentData = {
  title?: Array<{ text?: string } | null> | null;
  content?: PrismicRichTextBlock[] | null;
  cover_image?: {
    url?: string;
    alt?: string | null;
    dimensions?: {
      width?: number;
      height?: number;
    };
  } | null;
};

const PRISMIC_REPOSITORY_NAME = process.env.PRISMIC_REPOSITORY_NAME || "groundedliving";
const PRISMIC_ACCESS_TOKEN = process.env.PRISMIC_ACCESS_TOKEN;

const API_ENDPOINT = `https://${PRISMIC_REPOSITORY_NAME}.cdn.prismic.io/api/v2`;

const getMasterRef = cache(async (): Promise<string | null> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: PRISMIC_ACCESS_TOKEN
        ? {
            Authorization: `Token ${PRISMIC_ACCESS_TOKEN}`,
          }
        : undefined,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as PrismicRefResponse;
    const master = data.refs.find((ref) => ref.isMasterRef || ref.id === "master");
    return master?.ref ?? null;
  } catch {
    return null;
  }
});

async function fetchPrismicDocuments<T>(params: Record<string, string>): Promise<PrismicSearchResponse<T>> {
  const ref = await getMasterRef();
  if (!ref) {
    return { results: [] };
  }
  const url = new URL(`${API_ENDPOINT}/documents/search`);
  url.searchParams.set("ref", ref);
  url.searchParams.set("lang", "*");
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url, {
      headers: PRISMIC_ACCESS_TOKEN
        ? {
            Authorization: `Token ${PRISMIC_ACCESS_TOKEN}`,
          }
        : undefined,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return { results: [] };
    }

    return (await response.json()) as PrismicSearchResponse<T>;
  } catch {
    return { results: [] };
  }
}

function mapImage(field: PageDocumentData["cover_image"]): PrismicImage | null {
  if (!field?.url) {
    return null;
  }

  return {
    url: field.url,
    alt: field.alt ?? null,
    width: field.dimensions?.width,
    height: field.dimensions?.height,
  };
}

function mapPage(document: PrismicDocument<PageDocumentData>): PageDocument {
  const title = document.data.title?.find((block) => block?.text)?.text?.trim();

  return {
    id: document.id,
    uid: document.uid ?? document.id,
    title: title || "Untitled page",
    content: Array.isArray(document.data.content) ? document.data.content : null,
    coverImage: mapImage(document.data.cover_image ?? null),
  };
}

export const getPageByUID = cache(async (uid: string): Promise<PageDocument | null> => {
  if (!uid) {
    return null;
  }

  const response = await fetchPrismicDocuments<PageDocumentData>({
    q: `[[at(my.page.uid,"${uid}")]]`,
    pageSize: "1",
  });

  const [document] = response.results;
  return document ? mapPage(document) : null;
});
