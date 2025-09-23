export type RichTextMarkType = "bold" | "italic" | "underline" | "code";

export type RichTextMark = {
  type: RichTextMarkType;
};

export type RichTextNode = {
  nodeType: string;
  value?: string;
  marks?: RichTextMark[];
  data?: Record<string, unknown>;
  content?: RichTextNode[];
};

export type RichTextDocument = {
  nodeType: "document";
  data?: Record<string, unknown>;
  content: RichTextNode[];
};

export const BLOCKS = {
  DOCUMENT: "document",
  PARAGRAPH: "paragraph",
  HEADING_1: "heading-1",
  HEADING_2: "heading-2",
  HEADING_3: "heading-3",
  HEADING_4: "heading-4",
  HEADING_5: "heading-5",
  HEADING_6: "heading-6",
  UL_LIST: "unordered-list",
  OL_LIST: "ordered-list",
  LIST_ITEM: "list-item",
  QUOTE: "blockquote",
  HR: "hr",
  EMBEDDED_ASSET: "embedded-asset-block",
} as const;

export const INLINES = {
  HYPERLINK: "hyperlink",
} as const;

export const MARKS = {
  BOLD: "bold",
  ITALIC: "italic",
  UNDERLINE: "underline",
  CODE: "code",
} as const;
