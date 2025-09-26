import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import React from "react";

import { STUDIO_COOKIE_NAME } from "@/lib/studio/constants";
import { getExpectedHash } from "@/lib/studio/security";

// The studio dashboard relies on numerous browser-only APIs (local state, fetch, etc.),
// so we defer rendering to the client to avoid SSR hook errors that were triggering 500s.
const Dashboard = dynamic(
  () => import("@/components/studio/Dashboard").then((module) => module.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading studio…
      </div>
    ),
  },
);

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

const StudioPage = () => <Dashboard />;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionCookie = parseCookieValue(context.req.headers.cookie, STUDIO_COOKIE_NAME);
  const expectedHash = getExpectedHash();

  if (!expectedHash || sessionCookie !== expectedHash) {
    return {
      redirect: {
        destination: "/studio/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default StudioPage;
