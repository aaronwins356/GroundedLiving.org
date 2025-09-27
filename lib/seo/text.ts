export function collapseWhitespace(value?: string | null): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function pickFirst(values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  const fallback = values[values.length - 1];
  return typeof fallback === "string" ? fallback : "";
}

export function truncateAtBoundary(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > Math.floor(maxLength * 0.6) ? slice.slice(0, lastSpace) : slice;
  return `${base.replace(/[.…]+$/u, "").trimEnd()}…`;
}
