"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

import { NewsletterForm } from "@/components/ui/NewsletterForm";

const STORAGE_KEY = "gl:newsletter-ribbon:v1";
const DISMISS_VALUE = "dismissed";

function getStoredDismissal(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === DISMISS_VALUE;
  } catch (error) {
    console.warn("Unable to read newsletter ribbon preference", error);
    return false;
  }
}

function persistDismissal() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, DISMISS_VALUE);
  } catch (error) {
    console.warn("Unable to persist newsletter ribbon dismissal", error);
  }
}

type RibbonStyle = CSSProperties & { "--ribbon-offset"?: string };

export function NewsletterRibbon() {
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (getStoredDismissal()) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsOpen(true);
    }, 1100);

    return () => window.clearTimeout(timeout);
  }, []);

  const updateOffset = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }

    const banner = document.querySelector<HTMLElement>(".consent-banner");
    if (!banner) {
      setOffset(0);
      return;
    }

    const rect = banner.getBoundingClientRect();
    const computed = rect.height > 0 ? rect.height + 16 : 0;
    setOffset(computed);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateOffset();

    if (typeof document === "undefined") {
      return;
    }

    let resizeObserver: ResizeObserver | undefined;

    const ensureResizeObserver = () => {
      if (typeof ResizeObserver === "undefined") {
        updateOffset();
        return;
      }

      const banner = document.querySelector<HTMLElement>(".consent-banner");
      if (!banner) {
        resizeObserver?.disconnect();
        resizeObserver = undefined;
        updateOffset();
        return;
      }

      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => updateOffset());
      } else {
        resizeObserver.disconnect();
      }

      resizeObserver.observe(banner);
      updateOffset();
    };

    ensureResizeObserver();

    const mutation = new MutationObserver(() => {
      ensureResizeObserver();
    });

    mutation.observe(document.body, { childList: true, subtree: true });

    const handleResize = () => updateOffset();
    window.addEventListener("resize", handleResize);

    return () => {
      mutation.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updateOffset]);

  const dismiss = () => {
    persistDismissal();
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  const style: RibbonStyle | undefined = offset
    ? {
        "--ribbon-offset": `${offset}px`,
      }
    : undefined;

  return (
    <aside
      className="newsletter-ribbon"
      role="complementary"
      aria-label="Join the Grounded Living newsletter"
      style={style}
    >
      <div className="newsletter-ribbon__content">
        <div className="newsletter-ribbon__copy">
          <p className="newsletter-ribbon__eyebrow">Weekly rituals</p>
          <h2 className="newsletter-ribbon__title">Ground your week with slow, evidence-backed rituals.</h2>
          <p className="newsletter-ribbon__body">
            Receive seasonal recipes, holistic wellness essays, and gentle prompts to reset your routine.
          </p>
        </div>
        <div className="newsletter-ribbon__form">
          <NewsletterForm
            variant="inline"
            hideLabel
            source="sticky-ribbon"
            submitLabel="Join the list"
            hint="One thoughtful email each week—unsubscribe anytime."
          />
        </div>
        <button
          type="button"
          className="newsletter-ribbon__close"
          onClick={dismiss}
          aria-label="Dismiss newsletter invitation"
        >
          <span aria-hidden>&times;</span>
        </button>
      </div>
    </aside>
  );
}
