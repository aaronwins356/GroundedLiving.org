import React, { useState } from "react";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STUDIO_COOKIE_NAME } from "@/lib/studio/constants";

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),transparent_45%)]"
        />
        <Card className="w-full max-w-md border-white/10 !bg-white/[0.04] text-slate-100 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Grounded Studio</p>
            <CardTitle className="text-3xl text-white">Enter the content studio</CardTitle>
            <CardDescription className="text-sm text-slate-300">
              Provide the administrator key to access the editorial dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="studio-password" className="text-slate-200">
                  Studio password
                </Label>
                <Input
                  id="studio-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  wrapperClassName="border-white/10 bg-white/[0.05] text-slate-100"
                  className="text-slate-100 placeholder:text-slate-400"
                  disabled={isSubmitting}
                />
              </div>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              <Button type="submit" className="w-full justify-center rounded-2xl" loading={isSubmitting}>
                Access studio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionCookie = parseCookieValue(context.req.headers.cookie, STUDIO_COOKIE_NAME);

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
