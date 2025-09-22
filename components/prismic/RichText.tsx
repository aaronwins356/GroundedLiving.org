import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import type { PrismicRichTextBlock, PrismicRichTextSpan } from "../../lib/prismic";

type PrismicRichTextProps = {
  field: PrismicRichTextBlock[] | null | undefined;
};

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function wrapSpan(children: ReactNode[], span: PrismicRichTextSpan, key: string): ReactNode {
  const content = children.length === 1 ? children[0] : <Fragment>{children}</Fragment>;

  switch (span.type) {
    case "strong":
      return (
        <strong key={key}>
          {content}
        </strong>
      );
    case "em":
      return (
        <em key={key}>
          {content}
        </em>
      );
    case "hyperlink": {
      const rawUrl = typeof span.data?.url === "string" ? span.data.url : undefined;
      const href = rawUrl && rawUrl.startsWith("http") ? rawUrl : rawUrl ?? "#";
      const external = isExternalUrl(href);
      return (
        <a
          key={key}
          href={href}
          className="text-emerald-600 underline transition hover:text-emerald-500"
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {content}
        </a>
      );
    }
    default:
      return (
        <Fragment key={key}>
          {content}
        </Fragment>
      );
  }
}

function renderSpansRecursive(
  text: string,
  spans: PrismicRichTextSpan[],
  offset: number,
): ReactNode[] {
  if (!spans.length) {
    return text ? [text] : [];
  }

  const [current, ...rest] = spans;
  const startIndex = Math.max(0, current.start - offset);
  const endIndex = Math.max(startIndex, current.end - offset);

  const beforeText = text.slice(0, startIndex);
  const spanText = text.slice(startIndex, endIndex);
  const afterText = text.slice(endIndex);

  const overlaps = rest.filter((span) => span.start >= current.start && span.end <= current.end);
  const remaining = rest.filter((span) => span.end <= current.start || span.start >= current.end);

  const nodes: ReactNode[] = [];
  if (beforeText) {
    nodes.push(...renderSpansRecursive(beforeText, remaining.filter((span) => span.end <= current.start), offset));
  }

  const innerSpans = overlaps.sort((a, b) => (a.start - b.start) || b.end - a.end);
  const innerNodes = spanText
    ? renderSpansRecursive(spanText, innerSpans, current.start)
    : [];
  const key = `${current.start}-${current.end}-${current.type}`;
  nodes.push(wrapSpan(innerNodes.length ? innerNodes : [spanText], current, key));

  if (afterText) {
    const adjustedRemaining = remaining.filter((span) => span.start >= current.end);
    nodes.push(...renderSpansRecursive(afterText, adjustedRemaining, current.end));
  }

  return nodes;
}

function renderTextWithSpans(text: string | undefined, spans: PrismicRichTextSpan[] | undefined): ReactNode[] {
  if (!text) {
    return [];
  }
  if (!spans?.length) {
    return [text];
  }

  const sorted = [...spans].sort((a, b) => (a.start - b.start) || b.end - a.end);
  return renderSpansRecursive(text, sorted, 0);
}

function renderBlock(block: PrismicRichTextBlock, index: number): ReactNode {
  const key = `block-${index}`;
  switch (block.type) {
    case "heading1":
      return <h2 key={key}>{renderTextWithSpans(block.text, block.spans)}</h2>;
    case "heading2":
      return <h3 key={key}>{renderTextWithSpans(block.text, block.spans)}</h3>;
    case "heading3":
      return <h4 key={key}>{renderTextWithSpans(block.text, block.spans)}</h4>;
    case "heading4":
      return <h5 key={key}>{renderTextWithSpans(block.text, block.spans)}</h5>;
    case "heading5":
    case "heading6":
      return <h6 key={key}>{renderTextWithSpans(block.text, block.spans)}</h6>;
    case "paragraph":
      return <p key={key}>{renderTextWithSpans(block.text, block.spans)}</p>;
    case "preformatted":
      return (
        <pre key={key} className="whitespace-pre-wrap rounded-xl bg-slate-100 p-4">
          {block.text}
        </pre>
      );
    case "quote":
      return (
        <blockquote key={key} className="border-l-4 border-emerald-200 pl-4 italic text-slate-600">
          {renderTextWithSpans(block.text, block.spans)}
        </blockquote>
      );
    case "image":
      if (!block.url) {
        return null;
      }
      return (
        <figure key={key} className="my-8 space-y-3">
          <Image
            src={block.url}
            alt={block.alt ?? ""}
            width={block.dimensions?.width ?? 1600}
            height={block.dimensions?.height ?? 900}
            sizes="(min-width: 768px) 700px, 100vw"
            className="h-auto w-full rounded-2xl object-cover"
          />
          {block.alt ? <figcaption className="text-sm text-slate-500">{block.alt}</figcaption> : null}
        </figure>
      );
    default:
      return block.text ? <p key={key}>{renderTextWithSpans(block.text, block.spans)}</p> : null;
  }
}

export function PrismicRichText({ field }: PrismicRichTextProps) {
  if (!field || field.length === 0) {
    return null;
  }

  const nodes: ReactNode[] = [];
  let currentList: { type: "unordered" | "ordered"; items: ReactNode[] } | null = null;

  const flushList = () => {
    if (!currentList) {
      return;
    }
    if (currentList.type === "unordered") {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="list-disc space-y-2 pl-6">
          {currentList.items}
        </ul>,
      );
    } else {
      nodes.push(
        <ol key={`ol-${nodes.length}`} className="list-decimal space-y-2 pl-6">
          {currentList.items}
        </ol>,
      );
    }
    currentList = null;
  };

  field.forEach((block, index) => {
    if (block.type === "list-item" || block.type === "o-list-item") {
      const listType = block.type === "list-item" ? "unordered" : "ordered";
      if (!currentList || currentList.type !== listType) {
        flushList();
        currentList = { type: listType, items: [] };
      }
      currentList.items.push(
        <li key={`li-${index}`}>{renderTextWithSpans(block.text, block.spans)}</li>,
      );
      return;
    }

    flushList();
    const rendered = renderBlock(block, index);
    if (rendered) {
      nodes.push(rendered);
    }
  });

  flushList();

  return <>{nodes}</>;
}
