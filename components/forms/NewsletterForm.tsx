"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    console.log("Newsletter signup:", email);
    setSubmitted(true);
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        className="w-full flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/60"
      >
        {submitted ? "Thanks!" : "Join Newsletter"}
      </button>
    </form>
  );
}
