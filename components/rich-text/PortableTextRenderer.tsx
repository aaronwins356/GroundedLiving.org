import Image from "next/image";
import type { ReactNode } from "react";

import { hasSanityImageAsset, urlForImage, type SanityImageWithAlt } from "../../lib/sanity.image";
import type { PortableTextBlock, PortableTextMarkDef, PortableTextNode, PortableTextSpan } from "../../types/portableText";

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
      content = <strong className="text-accent">{content}</strong>;
      continue;
    }

    if (mark === "em") {
      content = <em>{content}</em>;
      continue;
    }

    if (mark === "underline") {
      content = <span className="underline decoration-brand-400">{content}</span>;
      continue;
    }

    if (mark === "code") {
      content = (
        <code className="rounded bg-brand-50 px-2 py-1 font-mono text-sm text-brand-700">{content}</code>
      );
      continue;
    }

    const definition = markDefs?.find((def) => def._key === mark && def._type === "link");
    if (definition?.href) {
      content = (
        <a
          href={definition.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 underline underline-offset-4 transition hover:text-brand-800"
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
        <h2 {...baseProps} className="mt-14 text-3xl font-semibold text-accent">
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 {...baseProps} className="mt-10 text-2xl font-semibold text-accent">
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 {...baseProps} className="mt-8 text-xl font-semibold text-accent">
          {children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote
          {...baseProps}
          className="my-10 rounded-3xl border-l-4 border-brand-300 bg-brand-50/70 px-6 py-5 text-lg italic text-brand-700"
        >
          {children}
        </blockquote>
      );
    default:
      return (
        <p {...baseProps} className="my-6 leading-relaxed text-accent-soft">
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
    <figure key={node._key} className="my-12 overflow-hidden rounded-3xl bg-mist">
      <Image
        src={imageUrl}
        alt={node.alt ?? "Blog post illustration"}
        width={1600}
        height={900}
        sizes="(min-width: 1024px) 768px, 100vw"
        className="h-auto w-full object-cover"
      />
      {node.alt ? (
        <figcaption className="px-6 pb-6 pt-3 text-center text-sm text-accent-soft">{node.alt}</figcaption>
      ) : null}
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
      <Tag
        key={`list-${elements.length}`}
        className="my-6 list-outside space-y-2 pl-6 text-accent-soft"
      >
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

  return <>{elements}</>;
}
