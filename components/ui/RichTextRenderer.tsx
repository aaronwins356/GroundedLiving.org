import type { RichTextDocument, RichTextNode } from "@/lib/rich-text";
import { BLOCKS, INLINES, MARKS } from "@/lib/rich-text";
import Link from "next/link";
import Image from "next/image";
import type { ContentfulImage } from "@/lib/contentful";
import type { ReactNode } from "react";

const defaultBlur = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+q0P+WAAAAABJRU5ErkJggg==";

type Props = {
  document: RichTextDocument | null;
  assets?: Record<string, ContentfulImage>;
};

export function RichTextRenderer({ document, assets }: Props) {
  if (!document) {
    return null;
  }

  return (
    <div className="prose">
      {renderNode(document, assets, "root")}
    </div>
  );
}

function renderChildren(nodes: RichTextNode[], assets: Record<string, ContentfulImage> | undefined, key: string) {
  return nodes.map((child, index) => renderNode(child, assets, `${key}-${index}`));
}

function renderNode(node: RichTextNode, assets: Record<string, ContentfulImage> | undefined, key: string): ReactNode {
  switch (node.nodeType) {
    case BLOCKS.DOCUMENT:
      return <>{renderChildren(node.content, assets, key)}</>;
    case BLOCKS.PARAGRAPH:
      return <p key={key}>{renderChildren(node.content, assets, key)}</p>;
    case BLOCKS.HEADING_1:
      return <h1 key={key}>{renderChildren(node.content, assets, key)}</h1>;
    case BLOCKS.HEADING_2:
      return <h2 key={key}>{renderChildren(node.content, assets, key)}</h2>;
    case BLOCKS.HEADING_3:
      return <h3 key={key}>{renderChildren(node.content, assets, key)}</h3>;
    case BLOCKS.HEADING_4:
      return <h4 key={key}>{renderChildren(node.content, assets, key)}</h4>;
    case BLOCKS.HEADING_5:
      return <h5 key={key}>{renderChildren(node.content, assets, key)}</h5>;
    case BLOCKS.HEADING_6:
      return <h6 key={key}>{renderChildren(node.content, assets, key)}</h6>;
    case BLOCKS.UL_LIST:
      return <ul key={key}>{renderChildren(node.content, assets, key)}</ul>;
    case BLOCKS.OL_LIST:
      return <ol key={key}>{renderChildren(node.content, assets, key)}</ol>;
    case BLOCKS.LIST_ITEM:
      return <li key={key}>{renderChildren(node.content, assets, key)}</li>;
    case BLOCKS.QUOTE:
      return <blockquote key={key}>{renderChildren(node.content, assets, key)}</blockquote>;
    case BLOCKS.HR:
      return <hr key={key} />;
    case BLOCKS.EMBEDDED_ASSET: {
      const target = (node as unknown as { data?: { target?: { sys?: { id?: string } } } }).data?.target;
      const assetId = target?.sys?.id;
      const asset = assetId ? assets?.[assetId] : undefined;
      if (!asset || !asset.url) {
        return null;
      }
      return (
        <figure key={key}>
          <Image
            src={asset.url}
            alt={asset.alt ?? ""}
            width={asset.width ?? 1200}
            height={asset.height ?? 800}
            className="mx-auto rounded-3xl shadow-xl"
            placeholder="blur"
            blurDataURL={asset.url.startsWith("data:") ? asset.url : defaultBlur}
          />
          {asset.alt ? <figcaption>{asset.alt}</figcaption> : null}
        </figure>
      );
    }
    case INLINES.HYPERLINK: {
      const href = typeof (node.data as { uri?: string } | undefined)?.uri === "string" ? (node.data as { uri?: string }).uri! : "#";
      const isExternal = href.startsWith("http");
      return (
        <Link key={key} href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
          {renderChildren(node.content ?? [], assets, key)}
        </Link>
      );
    }
    case "text": {
      return renderText(node, key);
    }
    default:
      if ("content" in node && Array.isArray(node.content)) {
        return <span key={key}>{renderChildren(node.content, assets, key)}</span>;
      }
      return null;
  }
}

function renderText(node: RichTextNode, key: string): ReactNode {
  let content: ReactNode = node.value ?? "";
  node.marks?.forEach((mark) => {
    switch (mark.type) {
      case MARKS.BOLD:
        content = <strong key={`${key}-bold`}>{content}</strong>;
        break;
      case MARKS.ITALIC:
        content = <em key={`${key}-italic`}>{content}</em>;
        break;
      case MARKS.CODE:
        content = <code key={`${key}-code`}>{content}</code>;
        break;
      case MARKS.UNDERLINE:
        content = <span key={`${key}-underline`} style={{ textDecoration: "underline" }}>{content}</span>;
        break;
      default:
        break;
    }
  });

  return <span key={key}>{content}</span>;
}
