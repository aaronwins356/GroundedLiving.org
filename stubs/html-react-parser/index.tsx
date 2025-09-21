import type { ReactNode } from "react";

export type DOMNode = Element | TextNode;

type TextNode = {
  type: "text";
  data: string;
};

export class Element {
  type = "tag" as const;
  name: string;
  attribs: Record<string, string | undefined>;
  children: DOMNode[];

  constructor(name: string, attribs: Record<string, string | undefined>, children: DOMNode[] = []) {
    this.name = name;
    this.attribs = attribs;
    this.children = children;
  }
}

type ParseOptions = {
  replace?: (node: DOMNode) => ReactNode | void;
};

function createTextNode(data: string): TextNode {
  return { type: "text", data };
}

function parseAttributes(attributeSource: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w[\w-]*)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)'|\s*=\s*([^\s"'>]+))?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(attributeSource)) !== null) {
    const [, key, doubleQuoted, singleQuoted, unquoted] = match;
    attributes[key] = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
  }

  return attributes;
}

export default function parse(html: string, options: ParseOptions = {}): ReactNode {
  const nodes: Array<string | ReactNode> = [];
  const anchorRegex = /<a\s+([^>]+)>(.*?)<\/a>/gis;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const [fullMatch, attributeSource, innerHtml] = match;
    const preceding = html.slice(lastIndex, match.index);

    if (preceding) {
      nodes.push(preceding);
    }

    const attribs = parseAttributes(attributeSource);
    const element = new Element("a", attribs, [createTextNode(innerHtml)]);
    const replacement = options.replace?.(element);
    nodes.push(replacement ?? createDefaultAnchor(element));

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < html.length) {
    nodes.push(html.slice(lastIndex));
  }

  if (nodes.length === 1) {
    return nodes[0];
  }

  return nodes.map((node, index) => (typeof node === "string" ? <span key={index}>{node}</span> : <span key={index}>{node}</span>));
}

function createDefaultAnchor(element: Element): ReactNode {
  const { attribs, children } = element;
  const text = children.find((child) => child.type === "text");
  return (
    <a {...attribs}>
      {text?.type === "text" ? text.data : null}
    </a>
  );
}
