import Image from "next/image";
import type { ReactNode } from "react";

import { hasSanityImageAsset, urlForImage, type SanityImageWithAlt } from "../../lib/sanity.image";
import type { PortableTextBlock, PortableTextMarkDef, PortableTextNode, PortableTextSpan } from "../../types/portableText";
import styles from "./PortableTextRenderer.module.css";

type PortableTextRendererProps = {
  value: PortableTextNode[];
};

type ListBuffer = {
  type: "bullet" | "number";
  items: PortableTextBlock[];
};

function renderSpan(span: PortableTextSpan, markDefs: PortableTextMarkDef[] | undefined): ReactNode {
  let content: ReactNode = span.text;

  for (const mark of span.marks ?? []) {
    if (mark === "strong") {
      content = <strong>{content}</strong>;
      continue;
    }

    if (mark === "em") {
      content = <em>{content}</em>;
      continue;
    }

    if (mark === "underline") {
      content = <span className={styles.underline}>{content}</span>;
      continue;
    }

    if (mark === "code") {
      content = <code className={styles.code}>{content}</code>;
      continue;
    }

    const definition = markDefs?.find((def) => def._key === mark && def._type === "link");
    if (definition?.href) {
      content = (
        <a
          href={definition.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {content}
        </a>
      );
    }
  }

  return content;
}

function renderChildren(block: PortableTextBlock): ReactNode {
  return (block.children ?? []).map((span) => (
    <span key={span._key}>{renderSpan(span, block.markDefs)}</span>
  ));
}

function renderBlock(block: PortableTextBlock): ReactNode {
  const children = renderChildren(block);
  const baseProps = { key: block._key };

  switch (block.style) {
    case "h1":
    case "h2":
      return (
        <h2 {...baseProps} className={styles.heading2}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 {...baseProps} className={styles.heading3}>
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 {...baseProps} className={styles.heading4}>
          {children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote {...baseProps} className={styles.blockquote}>
          {children}
        </blockquote>
      );
    default:
      return (
        <p {...baseProps} className={styles.paragraph}>
          {children}
        </p>
      );
  }
}

function renderImage(node: SanityImageWithAlt & { _key: string }) {
  if (!hasSanityImageAsset(node)) {
    return null;
  }

  const imageUrl = urlForImage(node).width(1600).fit("max").auto("format").url();

  return (
    <figure key={node._key} className={styles.figure}>
      <Image
        src={imageUrl}
        alt={node.alt ?? "Blog post illustration"}
        width={1600}
        height={900}
        sizes="(min-width: 1024px) 768px, 100vw"
      />
      {node.alt ? <figcaption className={styles.caption}>{node.alt}</figcaption> : null}
    </figure>
  );
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  const elements: ReactNode[] = [];
  let listBuffer: ListBuffer | null = null;

  const flushList = () => {
    if (!listBuffer) {
      return;
    }

    const Tag = listBuffer.type === "bullet" ? "ul" : "ol";
    elements.push(
      <Tag key={`list-${elements.length}`} className={styles.list}>
        {listBuffer.items.map((item) => (
          <li key={item._key}>{renderChildren(item)}</li>
        ))}
      </Tag>,
    );
    listBuffer = null;
  };

  value.forEach((node) => {
    if (node._type === "image") {
      flushList();
      elements.push(renderImage({ ...node, alt: node.alt }));
      return;
    }

    if (node.listItem) {
      if (!listBuffer || listBuffer.type !== node.listItem) {
        flushList();
        listBuffer = { type: node.listItem, items: [] };
      }
      listBuffer.items.push(node);
      return;
    }

    flushList();
    elements.push(renderBlock(node));
  });

  flushList();

  return <div className={styles.prose}>{elements}</div>;
}
