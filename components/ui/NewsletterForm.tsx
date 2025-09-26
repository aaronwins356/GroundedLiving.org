"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Newsletter signup placeholder", { email });
    setEmail("");
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-form__fields">
        <label className="newsletter-form__label" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="newsletter-form__input"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby="newsletter-hint"
        />
      </div>
      <div className="newsletter-form__actions">
        <Button type="submit">Subscribe</Button>
      </div>
      <p id="newsletter-hint" className="newsletter-form__hint">
        We&apos;ll send occasional updates from the Grounded Living journal. Unsubscribe anytime.
      </p>
    </form>
  );
}
