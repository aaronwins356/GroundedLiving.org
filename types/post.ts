export interface SanityImageReference {
  _type: "reference";
  _ref: string;
}

export interface SanityImageAsset {
  _type: "image";
  asset: SanityImageReference;
  alt?: string;
}

export type PortableTextSpan = {
  _key: string;
  _type: "span";
  text: string;
  marks?: string[];
};

export type PortableTextMarkDefinition = {
  _key: string;
  _type: string;
  href?: string;
};

export type PortableTextBlock = {
  _key: string;
  _type: "block";
  style?: string;
  markDefs?: PortableTextMarkDefinition[];
  children: PortableTextSpan[];
  listItem?: "bullet" | "number";
  level?: number;
};

export type PortableTextImage = SanityImageAsset & {
  _key: string;
};

export type PortableTextValue = Array<PortableTextBlock | PortableTextImage>;

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  coverImage?: SanityImageAsset;
}

export interface Post extends PostSummary {
  content: PortableTextValue;
}
