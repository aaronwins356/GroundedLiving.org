import type { NextApiRequest, NextApiResponse } from "next";

import { STUDIO_COOKIE_NAME } from "./studio/constants";
import { getExpectedHash } from "./studio/security";

const AUTH_COOKIE_NAME = STUDIO_COOKIE_NAME;

const parseCookieHeader = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) {
      return acc;
    }

    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
};

export const isStudioRequestAuthorized = (req: NextApiRequest): boolean => {
  const adminKey = process.env.STUDIO_ADMIN_KEY;
  if (!adminKey) {
    throw new Error("STUDIO_ADMIN_KEY environment variable is required");
  }

  if (req.headers["x-studio-key"] === adminKey) {
    return true;
  }

  const cookies = parseCookieHeader(req.headers.cookie);
  const expectedHash = getExpectedHash();
  if (!expectedHash) {
    return false;
  }

  return cookies[AUTH_COOKIE_NAME] === expectedHash;
};

export const requireStudioAuthorization = (req: NextApiRequest, res: NextApiResponse): boolean => {
  if (!isStudioRequestAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
};

export const createAuthCookie = (maxAgeSeconds = 60 * 60 * 4): string => {
  const expectedHash = getExpectedHash();
  if (!expectedHash) {
    throw new Error("STUDIO_ADMIN_KEY environment variable is required");
  }

  const base = `${AUTH_COOKIE_NAME}=${expectedHash}`;
  const attributes = [
    "HttpOnly",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "SameSite=Lax",
  ];

  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }

  return `${base}; ${attributes.join("; ")}`;
};

export const clearAuthCookie = (): string => {
  const attributes = [
    `${AUTH_COOKIE_NAME}=deleted`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
  ];

  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
};
