"use client";

import { useState } from "react";
import clsx from "clsx";

type Props = {
  endpoint?: string;
  providerLabel?: string;
};

export function NewsletterSignup({ endpoint, providerLabel = "newsletter" }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email")?.toString();

    if (!email) {
      setStatus("error");
      setMessage("Please add your email.");
      return;
    }

    if (!endpoint) {
      setStatus("success");
      setMessage("Thanks for joining the list! Connect the provider to enable submissions.");
      return;
    }

    try {
      setStatus("loading");
      setMessage(null);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      setStatus("success");
      setMessage("You\'re in! Watch your inbox for rituals and recipes.");
      event.currentTarget.reset();
    } catch (error) {
      console.error("Newsletter submission failed", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again or email hello@groundedliving.org.");
    }
  }

  return (
    <section className="section-shell">
      <div className="newsletter-card surface-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50/90 via-sage-100/60 to-rose-100/60" aria-hidden />
        <div className="relative grid gap-8 px-8 py-10 lg:grid-cols-[1.25fr_1fr] lg:px-12">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-sage-500">Stay grounded</p>
            <h2 className="font-heading text-3xl text-[#3b443b]">Join the {providerLabel} circle</h2>
            <p className="max-w-xl text-sm text-[#4c544c]">
              Receive gentle rituals, seasonal nourishment, and exclusive offers every Sunday morning. Unsubscribe any time.
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="text-sm font-medium text-[#3b443b]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-full border border-cream-200 bg-white/90 px-5 py-3 text-sm text-[#3b443b] shadow-inner focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-200"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <button
              type="submit"
              className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-full bg-[#3b443b] px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition", 
                status === "loading" ? "opacity-70" : "hover:bg-[#2f362f]",
              )}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Send me rituals"}
            </button>
            {message ? (
              <p
                className={clsx(
                  "text-xs",
                  status === "error" ? "text-rose-300" : "text-sage-500",
                )}
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
