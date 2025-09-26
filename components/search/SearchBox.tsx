"use client";

import { Search, X } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SearchDoc, SearchResultSet } from "@/lib/search/index";

import styles from "./SearchBox.module.css";

export interface SearchControllerState {
  query: string;
  setQuery: (value: string) => void;
  results: SearchDoc[];
  total: number;
  page: number;
  limit: number;
  tookMs: number;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (options?: { query?: string; page?: number }) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  reset: () => void;
}

interface UseSearchControllerOptions {
  initialQuery?: string;
  initialResults?: SearchResultSet | null;
}

function toSafePage(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

export function useSearchController({
  initialQuery = "",
  initialResults = null,
}: UseSearchControllerOptions): SearchControllerState {
  const sanitizedInitialQuery = initialQuery.trim();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchDoc[]>(initialResults?.results ?? []);
  const [total, setTotal] = useState(initialResults?.total ?? 0);
  const [page, setPage] = useState(initialResults ? toSafePage(initialResults.page) : 1);
  const [limit, setLimit] = useState(initialResults?.limit ?? 10);
  const [tookMs, setTookMs] = useState(initialResults?.tookMs ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(Boolean(sanitizedInitialQuery) || (initialResults?.total ?? 0) > 0);

  const lastExecutedRef = useRef<{ query: string; page: number }>({
    query: sanitizedInitialQuery,
    page: initialResults ? toSafePage(initialResults.page) : 1,
  });
  const skipInitialDebounceRef = useRef(Boolean(initialResults && sanitizedInitialQuery));
  const requestIdRef = useRef(0);
  const limitRef = useRef(limit);

  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  const applyResults = useCallback((payload: SearchResultSet) => {
    setResults(payload.results);
    setTotal(payload.total);
    setPage(toSafePage(payload.page));
    setLimit(payload.limit);
    setTookMs(payload.tookMs);
    setHasSearched(true);
  }, []);

  const resetState = useCallback(() => {
    setResults([]);
    setTotal(0);
    setPage(1);
    setTookMs(0);
    setError(null);
    setHasSearched(false);
  }, []);

  const fetchResults = useCallback(
    async (rawQuery: string, requestedPage = 1) => {
      const trimmedQuery = rawQuery.trim();
      if (!trimmedQuery) {
        requestIdRef.current += 1;
        resetState();
        lastExecutedRef.current = { query: "", page: 1 };
        return;
      }

      const nextRequestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          page: String(requestedPage),
          limit: String(limitRef.current),
        });
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }
        const payload = (await response.json()) as SearchResultSet;
        if (nextRequestId !== requestIdRef.current) {
          return;
        }
        applyResults(payload);
        lastExecutedRef.current = { query: trimmedQuery, page: toSafePage(payload.page) };
      } catch (error) {
        if (nextRequestId !== requestIdRef.current) {
          return;
        }
        console.error("Search fetch error", error);
        setError(error instanceof Error ? error.message : "Unable to load search results.");
        resetState();
      } finally {
        if (nextRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [applyResults, resetState],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      resetState();
      lastExecutedRef.current = { query: "", page: 1 };
      return;
    }

    if (skipInitialDebounceRef.current && trimmed === lastExecutedRef.current.query) {
      skipInitialDebounceRef.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      fetchResults(trimmed, 1);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fetchResults, query, resetState]);

  const runSearch = useCallback(
    async ({ query: overrideQuery, page: overridePage }: { query?: string; page?: number } = {}) => {
      skipInitialDebounceRef.current = false;
      const nextQuery = overrideQuery ?? query;
      const nextPage = overridePage ?? 1;
      await fetchResults(nextQuery, nextPage);
    },
    [fetchResults, query],
  );

  const goToPage = useCallback(
    async (nextPage: number) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      skipInitialDebounceRef.current = false;
      await fetchResults(trimmed, nextPage);
    },
    [fetchResults, query],
  );

  const reset = useCallback(() => {
    skipInitialDebounceRef.current = false;
    setQuery("");
    resetState();
    lastExecutedRef.current = { query: "", page: 1 };
  }, [resetState]);

  return useMemo(
    () => ({
      query,
      setQuery,
      results,
      total,
      page,
      limit,
      tookMs,
      isLoading,
      error,
      hasSearched,
      search: runSearch,
      goToPage,
      reset,
    }),
    [goToPage, hasSearched, isLoading, limit, page, query, reset, results, runSearch, tookMs, total, error],
  );
}

interface SearchBoxProps {
  controller: SearchControllerState;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit?: (query: string) => void;
  id?: string;
}

export function SearchBox({
  controller,
  label = "Search",
  placeholder = "Search rituals, remedies, or ingredients…",
  autoFocus = false,
  onSubmit,
  id = "site-search",
}: SearchBoxProps) {
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await controller.search();
      onSubmit?.(controller.query.trim());
    },
    [controller, onSubmit],
  );

  const handleClear = useCallback(() => {
    controller.reset();
  }, [controller]);

  return (
    <form className={styles.searchBox} role="search" aria-labelledby={`${id}-label`} onSubmit={handleSubmit}>
      <label id={`${id}-label`} className={styles.label} htmlFor={`${id}-input`}>
        {label}
      </label>
      <div className={styles.field}>
        <Search aria-hidden className={styles.icon} />
        <input
          id={`${id}-input`}
          type="search"
          value={controller.query}
          onChange={(event) => controller.setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          aria-controls={`${id}-results`}
          aria-describedby={controller.error ? `${id}-status` : undefined}
          className={styles.input}
        />
        {controller.query ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X aria-hidden />
          </button>
        ) : null}
        <button type="submit" className={styles.submit}>
          <span className="sr-only">Submit search</span>
        </button>
      </div>
      <div className={styles.status} id={`${id}-status`} role="status" aria-live="polite">
        {controller.isLoading ? "Searching…" : controller.error ? controller.error : null}
      </div>
    </form>
  );
}
