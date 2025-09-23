import React, { useState } from "react";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import "@/components/studio/styles.css";

const parseCookieValue = (cookieHeader: string | undefined, key: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .map((part) => part.split("="))
    .find(([name]) => name === key)?.[1];
};

const StudioLoginPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/studio/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Invalid password");
      }

      await router.push("/studio");
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Authentication failed";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Studio access · Grounded Living</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-100">
        <div
          className="w-full rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl"
          style={{ maxWidth: "28rem" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Grounded Studio</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">Enter the content studio</h1>
          <p className="mt-2 text-sm text-slate-400">
            Provide the administrator key to access the editorial dashboard.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-200">Studio password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing you in..." : "Access studio"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionCookie = parseCookieValue(context.req.headers.cookie, "studio_session");

  if (sessionCookie === "authenticated") {
    return {
      redirect: {
        destination: "/studio",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default StudioLoginPage;
