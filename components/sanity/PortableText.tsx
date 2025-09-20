import Image from "next/image";
import type { ReactNode } from "react";

import { urlForImage } from "../../lib/sanity.image";
import type {
  PortableTextBlock,
  PortableTextImage,
  PortableTextMarkDefinition,
  PortableTextSpan,
  PortableTextValue,
} from "../../types/post";

type PortableTextProps = {
  value: PortableTextValue;
};

type ListBuffer = {
  type: "bullet" | "number";
  items: ReactNode[];
};

function renderSpan(span: PortableTextSpan, markDefs: PortableTextMarkDefinition[] = []) {
  const marks = span.marks ?? [];
  return marks.reduceRight<ReactNode>((content: ReactNode, mark: string) => {
    switch (mark) {
      case "strong":
        return <strong key={`${span._key}-strong`}>{content}</strong>;
      case "em":
        return <em key={`${span._key}-em`}>{content}</em>;
      case "underline":
        return (
          <span key={`${span._key}-underline`} className="underline">
            {content}
          </span>
        );
      case "code":
        return (
          <code key={`${span._key}-code`} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm">
            {content}
          </code>
        );
      default: {
        const definition = markDefs.find((def) => def._key === mark);
        if (definition?._type === "link" && definition.href) {
          return (
            <a
              key={`${span._key}-link`}
              href={definition.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition hover:text-primary-dark"
            >
              {content}
            </a>
          );
        }
        return content;
      }
    }
  }, span.text);
}

function renderBlock(block: PortableTextBlock) {
  const children = block.children.map((child) => {
    if (child._type === "span") {
      return <span key={child._key}>{renderSpan(child, block.markDefs)}</span>;
    }
    return null;
  });

  switch (block.style) {
    case "h2":
      return (
        <h2 key={block._key} className="text-3xl font-semibold text-slate-900">
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 key={block._key} className="text-2xl font-semibold text-slate-900">
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 key={block._key} className="text-xl font-semibold text-slate-900">
          {children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote
          key={block._key}
          className="border-l-4 border-primary/60 bg-primary/5 px-6 py-4 text-lg italic text-primary-dark"
        >
          {children}
        </blockquote>
      );
    default:
      return (
        <p key={block._key} className="leading-relaxed">
          {children}
        </p>
      );
  }
}

function flushList(buffer: ListBuffer | null, elements: ReactNode[]) {
  if (!buffer) {
    return;
  }

  if (buffer.type === "number") {
    elements.push(<ol key={`list-${elements.length}`} className="list-decimal space-y-2 pl-6">{buffer.items}</ol>);
  } else {
    elements.push(<ul key={`list-${elements.length}`} className="list-disc space-y-2 pl-6">{buffer.items}</ul>);
  }
}

function isImageBlock(block: PortableTextBlock | PortableTextImage): block is PortableTextImage {
  return block._type === "image";
}

export function PortableText({ value }: PortableTextProps) {
  const elements: ReactNode[] = [];
  let listBuffer: ListBuffer | null = null;

  for (const block of value) {
    if (isImageBlock(block)) {
      const imageUrl = block.asset?._ref ? urlForImage(block).width(1200).fit("max").auto("format").url() : null;

      if (imageUrl) {
        flushList(listBuffer, elements);
        listBuffer = null;
        elements.push(
          <figure key={block._key} className="my-10 overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src={imageUrl}
              alt={block.alt ?? "Blog post illustration"}
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 768px, 100vw"
              className="h-auto w-full object-cover"
            />
            {block.alt ? (
              <figcaption className="px-6 pb-6 pt-3 text-center text-sm text-slate-500">{block.alt}</figcaption>
            ) : null}
          </figure>,
        );
      }
      continue;
    }

    if (block.listItem) {
      const listType: ListBuffer["type"] = block.listItem === "number" ? "number" : "bullet";
      const itemContent = <li key={block._key}>{renderBlock(block)}</li>;

      if (!listBuffer || listBuffer.type !== listType) {
        flushList(listBuffer, elements);
        listBuffer = { type: listType, items: [] };
      }

      listBuffer.items.push(itemContent);
      continue;
    }

    flushList(listBuffer, elements);
    listBuffer = null;
    elements.push(renderBlock(block));
  }

  flushList(listBuffer, elements);

  return <>{elements}</>;
}
