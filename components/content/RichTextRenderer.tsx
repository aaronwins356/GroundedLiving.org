"use client";

import React, { Fragment } from "react";

import type { RichTextDocument, RichTextNode } from "../../types/contentful";

interface RichTextRendererProps {
  document: RichTextDocument | null;
}

// We recreate a small subset of Tailwind-style typography rules by applying
// semantic class names that we later map to styles in `globals.css`.
const MARK_COMPONENTS: Record<string, (value: React.ReactNode, key: string) => React.ReactElement> = {
  bold: (value, key) => (
    <strong key={key} className="rt-strong">
      {value}
    </strong>
  ),
  italic: (value, key) => (
    <em key={key} className="rt-em">
      {value}
    </em>
  ),
  underline: (value, key) => (
    <span key={key} className="rt-underline">
      {value}
    </span>
  ),
  code: (value, key) => (
    <code key={key} className="rt-code">
      {value}
    </code>
  ),
};

function renderTextNode(node: RichTextNode, key: string) {
  const value = node.value ?? "";
  if (!node.marks || node.marks.length === 0) {
    return value;
  }

  return node.marks.reduce<React.ReactNode>((acc, mark, index) => {
    const markRenderer = MARK_COMPONENTS[mark.type];
    if (!markRenderer) {
      return acc;
    }

    return markRenderer(acc, `${key}-${index}`);
  }, value);
}

function renderNodes(nodes: RichTextNode[] = [], parentKey: string): React.ReactElement[] {
  return nodes.map((node, index) => {
    const key = `${parentKey}-${index}`;

    switch (node.nodeType) {
      case "paragraph":
        return (
          <p key={key} className="rt-paragraph">
            {renderNodes(node.content ?? [], key)}
          </p>
        );
      case "heading-1":
        return (
          <h1 key={key} className="rt-heading rt-heading-1">
            {renderNodes(node.content ?? [], key)}
          </h1>
        );
      case "heading-2":
        return (
          <h2 key={key} className="rt-heading rt-heading-2">
            {renderNodes(node.content ?? [], key)}
          </h2>
        );
      case "heading-3":
        return (
          <h3 key={key} className="rt-heading rt-heading-3">
            {renderNodes(node.content ?? [], key)}
          </h3>
        );
      case "heading-4":
        return (
          <h4 key={key} className="rt-heading rt-heading-4">
            {renderNodes(node.content ?? [], key)}
          </h4>
        );
      case "heading-5":
        return (
          <h5 key={key} className="rt-heading rt-heading-5">
            {renderNodes(node.content ?? [], key)}
          </h5>
        );
      case "heading-6":
        return (
          <h6 key={key} className="rt-heading rt-heading-6">
            {renderNodes(node.content ?? [], key)}
          </h6>
        );
      case "blockquote":
        return (
          <blockquote key={key} className="rt-blockquote">
            {renderNodes(node.content ?? [], key)}
          </blockquote>
        );
      case "ordered-list":
        return (
          <ol key={key} className="rt-list rt-list-ordered">
            {renderNodes(node.content ?? [], key)}
          </ol>
        );
      case "unordered-list":
        return (
          <ul key={key} className="rt-list rt-list-unordered">
            {renderNodes(node.content ?? [], key)}
          </ul>
        );
      case "list-item":
        return (
          <li key={key} className="rt-list-item">
            {renderNodes(node.content ?? [], key)}
          </li>
        );
      case "hyperlink": {
        const href = typeof node.data?.uri === "string" ? node.data.uri : "#";
        return (
          <a key={key} href={href} className="rt-link">
            {renderNodes(node.content ?? [], key)}
          </a>
        );
      }
      case "embedded-asset-block": {
        const asset = node.data?.target as { url?: string; description?: string; title?: string } | undefined;
        if (!asset?.url) {
          return <Fragment key={key} />;
        }
        return (
          <figure key={key} className="rt-figure">
            <img src={asset.url} alt={asset.description ?? asset.title ?? ""} className="rt-image" />
            {(asset.title || asset.description) && (
              <figcaption className="rt-figcaption">{asset.description ?? asset.title}</figcaption>
            )}
          </figure>
        );
      }
      case "hr":
        return <hr key={key} className="rt-divider" />;
      case "text":
        return <Fragment key={key}>{renderTextNode(node, key)}</Fragment>;
      default:
        return (
          <span key={key} className="rt-unknown">
            {renderNodes(node.content ?? [], key)}
          </span>
        );
    }
  });
}

export function RichTextRenderer({ document }: RichTextRendererProps) {
  if (!document) {
    return null;
  }

  return <div className="prose rt-container">{renderNodes(document.content, "root")}</div>;
}
