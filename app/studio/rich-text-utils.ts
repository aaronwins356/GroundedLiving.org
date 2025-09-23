"use client";

import type { RichTextDocument, RichTextMark, RichTextNode } from "../../types/contentful";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function serializeNode(node: RichTextNode): string {
  switch (node.nodeType) {
    case "paragraph":
      return `<p>${(node.content ?? []).map(serializeNode).join("")}</p>`;
    case "heading-1":
      return `<h1>${(node.content ?? []).map(serializeNode).join("")}</h1>`;
    case "heading-2":
      return `<h2>${(node.content ?? []).map(serializeNode).join("")}</h2>`;
    case "heading-3":
      return `<h3>${(node.content ?? []).map(serializeNode).join("")}</h3>`;
    case "heading-4":
      return `<h4>${(node.content ?? []).map(serializeNode).join("")}</h4>`;
    case "heading-5":
      return `<h5>${(node.content ?? []).map(serializeNode).join("")}</h5>`;
    case "heading-6":
      return `<h6>${(node.content ?? []).map(serializeNode).join("")}</h6>`;
    case "blockquote":
      return `<blockquote>${(node.content ?? []).map(serializeNode).join("")}</blockquote>`;
    case "unordered-list":
      return `<ul>${(node.content ?? []).map(serializeNode).join("")}</ul>`;
    case "ordered-list":
      return `<ol>${(node.content ?? []).map(serializeNode).join("")}</ol>`;
    case "list-item":
      return `<li>${(node.content ?? []).map(serializeNode).join("")}</li>`;
    case "hyperlink":
      return `<a href="${escapeHtml(String(node.data?.uri ?? ""))}" target="_blank" rel="noopener noreferrer">${(node.content ?? []).map(serializeNode).join("")}</a>`;
    case "text": {
      const value = escapeHtml(node.value ?? "");
      const marks = node.marks ?? [];
      return marks.reduce((output, mark) => wrapWithMark(output, mark), value);
    }
    case "hr":
      return "<hr />";
    default:
      return (node.content ?? []).map(serializeNode).join("");
  }
}

function wrapWithMark(value: string, mark: RichTextMark): string {
  switch (mark.type) {
    case "bold":
      return `<strong>${value}</strong>`;
    case "italic":
      return `<em>${value}</em>`;
    case "underline":
      return `<u>${value}</u>`;
    case "code":
      return `<code>${value}</code>`;
    default:
      return value;
  }
}

export function richTextToHtml(document: RichTextDocument | null): string {
  if (!document) {
    return "";
  }

  return (document.content ?? []).map(serializeNode).join("");
}

function parseNodes(nodeList: NodeListOf<ChildNode>, marks: RichTextMark[] = []): RichTextNode[] {
  const result: RichTextNode[] = [];

  nodeList.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent ?? "";
      if (value.trim().length === 0) {
        result.push({ nodeType: "text", value, marks: [...marks] });
      } else {
        result.push({ nodeType: "text", value, marks: [...marks] });
      }
      return;
    }

    if (!(node instanceof HTMLElement)) {
      return;
    }

    switch (node.tagName.toLowerCase()) {
      case "p":
        result.push({ nodeType: "paragraph", data: {}, content: parseNodes(node.childNodes, marks) });
        break;
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        result.push({
          nodeType: `heading-${node.tagName.toLowerCase().replace("h", "")}` as RichTextNode["nodeType"],
          data: {},
          content: parseNodes(node.childNodes, marks),
        });
        break;
      case "blockquote":
        result.push({ nodeType: "blockquote", data: {}, content: parseNodes(node.childNodes, marks) });
        break;
      case "ul":
        result.push({ nodeType: "unordered-list", data: {}, content: parseNodes(node.childNodes, marks) });
        break;
      case "ol":
        result.push({ nodeType: "ordered-list", data: {}, content: parseNodes(node.childNodes, marks) });
        break;
      case "li":
        result.push({ nodeType: "list-item", data: {}, content: parseNodes(node.childNodes, marks) });
        break;
      case "a": {
        const href = node.getAttribute("href") ?? "";
        result.push({ nodeType: "hyperlink", data: { uri: href }, content: parseNodes(node.childNodes, marks) });
        break;
      }
      case "strong":
        result.push(...parseNodes(node.childNodes, [...marks, { type: "bold" }]));
        break;
      case "em":
        result.push(...parseNodes(node.childNodes, [...marks, { type: "italic" }]));
        break;
      case "u":
        result.push(...parseNodes(node.childNodes, [...marks, { type: "underline" }]));
        break;
      case "code":
        result.push(...parseNodes(node.childNodes, [...marks, { type: "code" }]));
        break;
      case "br":
        result.push({ nodeType: "text", value: "\n", marks: [...marks] });
        break;
      default:
        result.push(...parseNodes(node.childNodes, marks));
        break;
    }
  });

  return result;
}

export function htmlToRichText(html: string): RichTextDocument {
  if (typeof window === "undefined") {
    // Provide a basic fallback when rendering on the server.
    return {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value: html,
              marks: [],
            },
          ],
        },
      ],
    } satisfies RichTextDocument;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const content = parseNodes(parsed.body.childNodes);

  return {
    nodeType: "document",
    data: {},
    content: content.length > 0 ? content : [{ nodeType: "paragraph", data: {}, content: [] }],
  } satisfies RichTextDocument;
}
