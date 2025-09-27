"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { announce } from "@/lib/a11y/announcer";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics";

type NewsletterStatus = "idle" | "submitting" | "success" | "error";

export interface NewsletterFormProps {
  tag?: string;
  source?: string;
  placeholder?: string;
  submitLabel?: string;
  hint?: string;
  successRedirect?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  hideLabel?: boolean;
  variant?: "stacked" | "inline";
}

const DEFAULT_SUCCESS_REDIRECT = "/thank-you?lg=evening-ritual-checklist";

export function NewsletterForm({
  tag,
  source,
  placeholder = "you@example.com",
  submitLabel = "Subscribe",
  hint = "We’ll send occasional updates from the Grounded Living journal. Unsubscribe anytime.",
  successRedirect = DEFAULT_SUCCESS_REDIRECT,
  className,
  inputClassName,
  buttonClassName,
  hideLabel = false,
  variant = "stacked",
}: NewsletterFormProps) {
  const router = useRouter();
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.push(successRedirect);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [router, status, successRedirect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tag, source }),
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !data?.ok) {
        const errorMessage = data?.error ?? "We couldn’t save your email just yet. Please try again.";
        setStatus("error");
        setMessage(errorMessage);
        announce(errorMessage, "assertive");
        return;
      }

      setStatus("success");
      setMessage("Success! You’re on the list.");
      announce("Success! You're on the newsletter list.", "polite");
      track("newsletter_subscribed", { tag, source });
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription failed", error);
      setStatus("error");
      setMessage("We couldn’t reach the newsletter service. Please try again.");
      announce("We couldn’t reach the newsletter service. Please try again.", "assertive");
    }
  };

  const renderInline = () => (
    <form
      className={cn("newsletter-form", "newsletter-form--inline", className)}
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor={inputId} className={cn("newsletter-form__label", hideLabel && "visually-hidden")}>
        Email address
      </label>
      <div className="newsletter-form__inline-fields">
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          className={cn("newsletter-form__input", inputClassName)}
          placeholder={placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={`${inputId}-hint`}
        />
        <Button
          type="submit"
          className={cn(buttonClassName)}
          loading={status === "submitting"}
          disabled={status === "submitting"}
        >
          {submitLabel}
        </Button>
      </div>
      <p id={`${inputId}-hint`} className="newsletter-form__hint">
        {hint}
      </p>
      <p className="newsletter-form__status" aria-live="polite">
        {message}
      </p>
    </form>
  );

  if (variant === "inline") {
    return renderInline();
  }

  return (
    <form className={cn("newsletter-form", className)} onSubmit={handleSubmit} noValidate>
      <div className="newsletter-form__fields">
        <label htmlFor={inputId} className={cn("newsletter-form__label", hideLabel && "visually-hidden")}>
          Email address
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          className={cn("newsletter-form__input", inputClassName)}
          placeholder={placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={`${inputId}-hint`}
        />
      </div>
      <div className="newsletter-form__actions">
        <Button type="submit" loading={status === "submitting"} disabled={status === "submitting"} className={buttonClassName}>
          {submitLabel}
        </Button>
      </div>
      <p id={`${inputId}-hint`} className="newsletter-form__hint">
        {hint}
      </p>
      <p className="newsletter-form__status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
