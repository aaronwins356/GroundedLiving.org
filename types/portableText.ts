export type PortableTextMarkDef = {
  _key: string;
  _type: string;
  href?: string;
};

export type PortableTextSpan = {
  _key: string;
  _type: "span";
  text: string;
  marks?: string[];
};

export type PortableTextBlock = {
  _key: string;
  _type: "block";
  style?: string;
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  listItem?: "bullet" | "number";
  level?: number;
};

export type PortableTextImage = {
  _key: string;
  _type: "image";
  alt?: string;
  asset?: {
    _ref?: string;
  };
};

export type PortableTextNode = PortableTextBlock | PortableTextImage;
