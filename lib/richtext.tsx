import { Fragment, type ReactNode } from "react";

import Image from "next/image";

import { InfographicCard } from "@/components/blog/InfographicCard";
import type { InfographicBlock, RichTextDocument, RichTextMark, RichTextNode } from "@/types/contentful";

import { cn } from "@/lib/utils/cn";

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface HeadingSlugger {
  slug: (value: string) => string;
}

interface RenderContext {
  slugger: HeadingSlugger;
  headings: TableOfContentsItem[];
}

interface RichTextProps {
  document: RichTextDocument | null;
  className?: string;
  /**
   * When `false`, the caller is responsible for providing a `.prose` wrapper.
   * This is useful when the component is rendered inside `ArticleShell`, which
   * already includes the typography styles.
   */
  withProse?: boolean;
}

export function RichText({ document, className, withProse = true }: RichTextProps) {
  if (!document) {
    return null;
  }

  const wrapperClassName = withProse ? cn("prose", className) : className;

  return <div className={wrapperClassName}>{renderNodes(document.content, "root")}</div>;
}

function renderNodes(nodes: RichTextNode[] = [], path: string): ReactNode {
  return nodes.map((node, index) => renderNode(node, `${path}-${index}`));
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  switch (node.nodeType) {
    case "paragraph": {
      const children = renderNodes(node.content, key);
      if (!children || (Array.isArray(children) && children.every((child) => child === null))) {
        return <br key={key} />;
      }
      return <p key={key}>{children}</p>;
    }
    case "heading-1":
      return <h1 key={key}>{renderNodes(node.content, key)}</h1>;
    case "heading-2":
      return <h2 key={key}>{renderNodes(node.content, key)}</h2>;
    case "heading-3":
      return <h3 key={key}>{renderNodes(node.content, key)}</h3>;
    case "heading-4":
      return <h4 key={key}>{renderNodes(node.content, key)}</h4>;
    case "heading-5":
      return <h5 key={key}>{renderNodes(node.content, key)}</h5>;
    case "heading-6":
      return <h6 key={key}>{renderNodes(node.content, key)}</h6>;
    case "unordered-list":
      return <ul key={key}>{renderNodes(node.content, key)}</ul>;
    case "ordered-list":
      return <ol key={key}>{renderNodes(node.content, key)}</ol>;
    case "list-item":
      return <li key={key}>{renderNodes(node.content, key)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderNodes(node.content, key)}</blockquote>;
    case "embedded-asset-block": {
      const target = (
        node.data as {
          target?: {
            url?: string;
            description?: string;
            title?: string;
            width?: number;
            height?: number;
          };
        }
      )?.target;
      if (!target?.url) {
        return null;
      }
      const alt = target.description ?? target.title ?? "Embedded image";
      return (
        <figure key={key}>
          <Image
            src={target.url}
            alt={alt}
            width={typeof target.width === "number" ? target.width : 1200}
            height={typeof target.height === "number" ? target.height : 630}
            sizes="(min-width: 768px) 720px, 100vw"
          />
          {alt ? <figcaption>{alt}</figcaption> : null}
        </figure>
      );
    }
    case "embedded-entry-block": {
      const target = node.data?.target as { __typename?: string; data?: InfographicBlock } | undefined;
      if (!target?.__typename || !target.data) {
        return null;
      }

      if (target.__typename === "InfographicBlock") {
        const { data } = target;
        return (
          <div key={key} className="not-prose">
            <InfographicCard
              id={data.id}
              eyebrow={data.eyebrow}
              title={data.title}
              summary={data.summary}
              items={data.items}
              footnote={data.footnote}
              theme={data.theme ?? "linen"}
            />
          </div>
        );
      }

      return null;
    }
    case "hyperlink": {
      const uri = typeof node.data?.uri === "string" ? node.data.uri : undefined;
      const children = renderNodes(node.content, key);
      if (!uri) {
        return children;
      }
      return (
        <a key={key} href={uri} rel="noreferrer noopener" target={uri.startsWith("/") ? undefined : "_blank"}>
          {children}
        </a>
      );
    }
    case "text":
      return renderText(node.value ?? "", node.marks ?? [], key);
    default:
      return node.content ? renderNodes(node.content, key) : null;
  }
}

function renderText(value: string, marks: RichTextMark[], key: string): ReactNode {
  let element: ReactNode = value;
  marks.forEach((mark) => {
    switch (mark.type) {
      case "bold":
        element = <strong>{element}</strong>;
        break;
      case "italic":
        element = <em>{element}</em>;
        break;
      case "underline":
        element = <u>{element}</u>;
        break;
      case "code":
        element = <code>{element}</code>;
        break;
      default:
        break;
    }
  });

  return <Fragment key={key}>{element}</Fragment>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderNodesToHtml(nodes: RichTextNode[] = [], context: RenderContext): string {
  return nodes.map((node) => renderNodeToHtml(node, context)).join("");
}

function renderNodeToHtml(node: RichTextNode, context: RenderContext): string {
  switch (node.nodeType) {
    case "paragraph":
      return `<p class=\"rt-paragraph\">${renderNodesToHtml(node.content ?? [], context)}</p>`;
    case "heading-1":
    case "heading-2":
    case "heading-3":
    case "heading-4":
    case "heading-5":
    case "heading-6": {
      const level = Number.parseInt(node.nodeType.split("-")[1] ?? "1", 10);
      const textContent = collectPlainText(node.content ?? []);
      const slugSource = textContent || `section-${context.headings.length + 1}`;
      const id = context.slugger.slug(slugSource);
      if (level >= 2 && level <= 3 && textContent) {
        context.headings.push({ id, level, title: textContent });
      }
      return `<h${level} id=\"${id}\" class=\"rt-heading rt-heading-${level}\">${renderNodesToHtml(
        node.content ?? [],
        context,
      )}</h${level}>`;
    }
    case "unordered-list":
      return `<ul class=\"rt-list rt-list-unordered\">${renderNodesToHtml(node.content ?? [], context)}</ul>`;
    case "ordered-list":
      return `<ol class=\"rt-list rt-list-ordered\">${renderNodesToHtml(node.content ?? [], context)}</ol>`;
    case "list-item":
      return `<li class=\"rt-list-item\">${renderNodesToHtml(node.content ?? [], context)}</li>`;
    case "blockquote":
      return `<blockquote class=\"rt-blockquote\">${renderNodesToHtml(node.content ?? [], context)}</blockquote>`;
    case "hyperlink": {
      const uri = typeof node.data?.uri === "string" ? node.data.uri : "#";
      const children = renderNodesToHtml(node.content ?? [], context);
      return `<a class=\"rt-link\" href=\"${escapeHtml(uri)}\">${children}</a>`;
    }
    case "embedded-asset-block": {
      const target = (
        node.data as {
          target?: { url?: string; description?: string; title?: string; width?: number; height?: number };
        }
      )?.target;
      if (!target?.url) {
        return "";
      }
      const alt = target.description ?? target.title ?? "Embedded image";
      const widthAttr = typeof target.width === "number" ? ` width=\"${target.width}\"` : "";
      const heightAttr = typeof target.height === "number" ? ` height=\"${target.height}\"` : "";
      const segments = [
        `<figure class=\"rt-figure\">`,
        `<img class=\"rt-image\" src=\"${escapeHtml(target.url)}\" alt=\"${escapeHtml(alt)}\"${widthAttr}${heightAttr} />`,
      ];
      if (alt) {
        segments.push(`<figcaption class=\"rt-figcaption\">${escapeHtml(alt)}</figcaption>`);
      }
      segments.push("</figure>");
      return segments.join("");
    }
    case "hr":
      return `<hr class=\"rt-divider\" />`;
    case "text": {
      const content = escapeHtml(node.value ?? "");
      return (node.marks ?? []).reduce((acc, mark) => {
        switch (mark.type) {
          case "bold":
            return `<strong class=\"rt-strong\">${acc}</strong>`;
          case "italic":
            return `<em class=\"rt-em\">${acc}</em>`;
          case "underline":
            return `<span class=\"rt-underline\">${acc}</span>`;
          case "code":
            return `<code class=\"rt-code\">${acc}</code>`;
          default:
            return acc;
        }
      }, content);
    }
    default:
      return node.content ? renderNodesToHtml(node.content, context) : "";
  }
}

function collectPlainText(nodes: RichTextNode[] = []): string {
  return nodes
    .map((node) => {
      if (node.nodeType === "text") {
        return node.value ?? "";
      }

      if (node.content) {
        return collectPlainText(node.content);
      }

      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function createHeadingSlugger(): HeadingSlugger {
  const counts = new Map<string, number>();
  return {
    slug(value: string) {
      const base = slugifyHeading(value);
      const safeBase = base || "section";
      const previous = counts.get(safeBase) ?? 0;
      const next = previous + 1;
      counts.set(safeBase, next);
      return previous === 0 ? safeBase : `${safeBase}-${next}`;
    },
  };
}

function slugifyHeading(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface RenderRichTextResult {
  html: string;
  headings: TableOfContentsItem[];
}

export function renderRichText(document: RichTextDocument | null): RenderRichTextResult {
  if (!document) {
    return { html: "", headings: [] };
  }

  const context: RenderContext = { slugger: createHeadingSlugger(), headings: [] };
  const html = renderNodesToHtml(document.content ?? [], context);
  return { html, headings: context.headings };
}

export function richTextToHtml(document: RichTextDocument | null): string {
  return renderRichText(document).html;
}

export function richTextToPlainText(document: RichTextDocument | null): string {
  if (!document) {
    return "";
  }

  return collectPlainText(document.content ?? []);
}

