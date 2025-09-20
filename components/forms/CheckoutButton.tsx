"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Unable to start checkout");
      }
      const data = (await response.json()) as { url?: string; error?: string };
      if (data.error || !data.url) {
        throw new Error(data.error ?? "Missing checkout URL");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Redirecting..." : "Subscribe for $5/month"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
