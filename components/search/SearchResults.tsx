"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import type { SearchDoc } from "@/lib/search/index";

import type { SearchControllerState } from "./SearchBox";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  controller: SearchControllerState;
  listId?: string;
  emptyState?: React.ReactNode;
}

function formatPublishedDate(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SearchResults({ controller, listId = "site-search-results", emptyState }: SearchResultsProps) {
  const pageCount = useMemo(() => Math.max(Math.ceil(controller.total / controller.limit), 1), [controller.total, controller.limit]);

  const queryLabel = controller.query.trim();
  const hasResults = controller.results.length > 0;

  const rangeStart = hasResults ? (controller.page - 1) * controller.limit + 1 : 0;
  const rangeEnd = hasResults ? rangeStart + controller.results.length - 1 : 0;

  const summary = useMemo(() => {
    if (controller.isLoading) {
      return queryLabel ? `Searching for “${queryLabel}”…` : "Searching…";
    }

    if (!controller.hasSearched) {
      return "Type a wellness topic to explore rituals, guides, and product spotlights.";
    }

    if (!hasResults) {
      return queryLabel ? `No matches for “${queryLabel}”.` : "No matches found.";
    }

    return `Showing ${rangeStart}–${rangeEnd} of ${controller.total} for “${queryLabel}”.`;
  }, [controller.hasSearched, controller.isLoading, controller.total, hasResults, queryLabel, rangeEnd, rangeStart]);

  const handlePrev = useCallback(() => {
    if (controller.page <= 1 || controller.isLoading) {
      return;
    }
    void controller.goToPage(controller.page - 1);
  }, [controller]);

  const handleNext = useCallback(() => {
    if (controller.page >= pageCount || controller.isLoading) {
      return;
    }
    void controller.goToPage(controller.page + 1);
  }, [controller, pageCount]);

  const renderResult = useCallback(
    (doc: SearchDoc) => {
      const publishedLabel = formatPublishedDate(doc.publishedAt);
      return (
        <li key={doc.id}>
          <article className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.meta}>
                <span className={styles.category}>{doc.category}</span>
                {publishedLabel ? <time dateTime={doc.publishedAt}>{publishedLabel}</time> : null}
              </div>
              <h3 className={styles.title}>
                <Link href={doc.url}>{doc.title}</Link>
              </h3>
              {doc.excerpt ? <p className={styles.excerpt}>{doc.excerpt}</p> : null}
              <div className={styles.author}>By {doc.author}</div>
            </div>
          </article>
        </li>
      );
    },
    [],
  );

  return (
    <section className={styles.results} aria-live="polite">
      <div className={styles.summary}>
        <strong>{summary}</strong>
        {controller.tookMs && controller.hasSearched && hasResults ? (
          <span className={styles.timing}>({controller.tookMs} ms)</span>
        ) : null}
      </div>
      {!controller.hasSearched ? (
        <div className={styles.placeholder}>{emptyState}</div>
      ) : hasResults ? (
        <ol className={styles.list} id={listId} aria-label="Search results">
          {controller.results.map((doc) => renderResult(doc))}
        </ol>
      ) : (
        <div className={styles.empty}>{emptyState}</div>
      )}
      {controller.hasSearched && hasResults ? (
        <nav className={styles.pagination} aria-label="Search results pages">
          <button type="button" onClick={handlePrev} disabled={controller.isLoading || controller.page <= 1}>
            Previous
          </button>
          <span>
            Page {controller.page} of {pageCount}
          </span>
          <button type="button" onClick={handleNext} disabled={controller.isLoading || controller.page >= pageCount}>
            Next
          </button>
        </nav>
      ) : null}
    </section>
  );
}
