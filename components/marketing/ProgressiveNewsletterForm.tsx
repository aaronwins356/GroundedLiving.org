"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { NewsletterFormProps } from "@/components/ui/NewsletterForm";

interface ProgressiveNewsletterFormProps extends NewsletterFormProps {
  fallback?: ReactNode;
  /**
   * Allow tuning of the pre-load distance so we can balance interactivity with
   * network usage when the module is dynamically imported.
   */
  rootMargin?: string;
}

type NewsletterFormComponent = typeof import("@/components/ui/NewsletterForm")["NewsletterForm"];

const DEFAULT_ROOT_MARGIN = "256px 0px";

export function ProgressiveNewsletterForm({
  fallback,
  rootMargin = DEFAULT_ROOT_MARGIN,
  ...props
}: ProgressiveNewsletterFormProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [FormComponent, setFormComponent] = useState<NewsletterFormComponent | null>(null);

  useEffect(() => {
    if (!shouldLoad || FormComponent) {
      return;
    }

    let cancelled = false;

    // Dynamically import the interactive form only when a visitor is close to
    // viewing the signup, keeping the initial JavaScript bundle lean for the
    // page load.
    void import("@/components/ui/NewsletterForm").then((module) => {
      if (!cancelled) {
        setFormComponent(() => module.NewsletterForm);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [FormComponent, shouldLoad]);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const element = containerRef.current;

    if (!element) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, shouldLoad]);

  return (
    <div ref={handleRef} aria-live="polite">
      {FormComponent ? <FormComponent {...props} /> : fallback ?? null}
    </div>
  );
}
