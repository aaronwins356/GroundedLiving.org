"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

import { NewsletterForm } from "@/components/ui/NewsletterForm";

const STORAGE_KEY = "gl:newsletter-ribbon:v1";
const DISMISS_VALUE = "dismissed";
const VARIANT_STORAGE_KEY = "gl:newsletter-ribbon:variant";

interface RibbonVariant {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  submitLabel: string;
  hint: string;
  successRedirect: string;
  tag: string;
}

const RIBBON_VARIANTS: RibbonVariant[] = [
  {
    id: "slow-rituals",
    eyebrow: "Weekly rituals",
    title: "Ground your week with slow, evidence-backed rituals.",
    body: "Receive seasonal recipes, holistic wellness essays, and gentle prompts to reset your routine.",
    submitLabel: "Join the list",
    hint: "One thoughtful email each week—unsubscribe anytime.",
    successRedirect: "/thank-you?lg=herbal-remedies-cold-season",
    tag: "lead-magnet:herbal-remedies",
  },
  {
    id: "seasonal-kitchen",
    eyebrow: "Kitchen inspiration",
    title: "Plan nourishing breakfasts without the morning scramble.",
    body: "Get the 7-day whole-food breakfast blueprint plus weekly seasonal menu notes.",
    submitLabel: "Send the plan",
    hint: "Quick recipes, no spam. Opt out anytime.",
    successRedirect: "/thank-you?lg=whole-food-breakfast-blueprint",
    tag: "lead-magnet:whole-food-breakfasts",
  },
];

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
  const defaultVariant = RIBBON_VARIANTS[0];
  if (!defaultVariant) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [variant, setVariant] = useState<RibbonVariant>(defaultVariant);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedVariant = window.localStorage.getItem(VARIANT_STORAGE_KEY);
      const fallbackVariant = storedVariant
        ? RIBBON_VARIANTS.find((item) => item.id === storedVariant)
        : undefined;
      if (fallbackVariant) {
        setVariant(fallbackVariant);
        return;
      }

      const index = Math.floor(Math.random() * RIBBON_VARIANTS.length);
      const selected = RIBBON_VARIANTS[index] ?? RIBBON_VARIANTS[0];
      setVariant(selected);
      window.localStorage.setItem(VARIANT_STORAGE_KEY, selected.id);
    } catch (error) {
      console.warn("Unable to resolve newsletter ribbon variant", error);
    }
  }, []);

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
      data-variant={variant.id}
    >
      <div className="newsletter-ribbon__content">
        <div className="newsletter-ribbon__copy">
          <p className="newsletter-ribbon__eyebrow">{variant.eyebrow}</p>
          <h2 className="newsletter-ribbon__title">{variant.title}</h2>
          <p className="newsletter-ribbon__body">{variant.body}</p>
        </div>
        <div className="newsletter-ribbon__form">
          <NewsletterForm
            variant="inline"
            hideLabel
            source="sticky-ribbon"
            submitLabel={variant.submitLabel}
            hint={variant.hint}
            successRedirect={variant.successRedirect}
            tag={variant.tag}
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
