export const LINK_MAP: Record<string, string> = {
  "circadian rhythm": "/blog/category/circadian-rhythm",
  "blue light": "/blog/blue-light-evening-guide",
  "sleep routine": "/blog/sleep-routine-starter",
};

const MAX_AUTOLINKS = 3;

function isWordBoundary(char: string | undefined): boolean {
  if (!char) {
    return true;
  }
  return !/[a-z0-9]/i.test(char);
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function linkFirstOccurrence(paragraph: string, phrase: string, url: string): string {
  const tokens = paragraph.split(/(<[^>]+>)/);
  const phraseLower = phrase.toLowerCase();

  for (let i = 0; i < tokens.length; i += 1) {
    if (!tokens[i]) {
      continue;
    }
    if (tokens[i].startsWith("<")) {
      continue;
    }
    const segment = tokens[i];
    if (!segment) {
      continue;
    }
    const lowered = segment.toLowerCase();
    let searchIndex = 0;
    while (searchIndex < lowered.length) {
      const matchIndex = lowered.indexOf(phraseLower, searchIndex);
      if (matchIndex === -1) {
        break;
      }
      const beforeChar = lowered[matchIndex - 1];
      const afterChar = lowered[matchIndex + phraseLower.length];
      if (isWordBoundary(beforeChar) && isWordBoundary(afterChar)) {
        const original = segment.slice(matchIndex, matchIndex + phrase.length);
        const anchor = `<a href="${escapeAttribute(url)}">${original}</a>`;
        tokens[i] = `${segment.slice(0, matchIndex)}${anchor}${segment.slice(matchIndex + phrase.length)}`;
        return tokens.join("");
      }
      searchIndex = matchIndex + phraseLower.length;
    }
  }

  return paragraph;
}

export function autoLinkHtml(html: string): string {
  if (!html) {
    return html;
  }

  const phrases = Object.entries(LINK_MAP);
  if (phrases.length === 0) {
    return html;
  }

  let linkCount = 0;
  const linkedPhrases = new Set<string>();

  return html.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (paragraph) => {
    if (linkCount >= MAX_AUTOLINKS) {
      return paragraph;
    }

    if (/<a\b/i.test(paragraph) || /<code\b/i.test(paragraph) || /<pre\b/i.test(paragraph)) {
      return paragraph;
    }

    let updated = paragraph;
    for (const [phrase, url] of phrases) {
      if (linkCount >= MAX_AUTOLINKS) {
        break;
      }
      if (linkedPhrases.has(phrase)) {
        continue;
      }
      const next = linkFirstOccurrence(updated, phrase, url);
      if (next !== updated) {
        updated = next;
        linkedPhrases.add(phrase);
        linkCount += 1;
      }
    }

    return updated;
  });
}
