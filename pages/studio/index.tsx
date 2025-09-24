import React from "react";

import type { GetServerSideProps } from "next";

import { Dashboard } from "@/components/studio/Dashboard";
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

const StudioPage = () => <Dashboard />;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionCookie = parseCookieValue(context.req.headers.cookie, STUDIO_COOKIE_NAME);

  if (sessionCookie !== "authenticated") {
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
