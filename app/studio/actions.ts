"use server";

import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { STUDIO_COOKIE_NAME } from "./constants";
import { computeHash, getExpectedHash } from "./security";

export interface AuthState {
  success: boolean;
  message?: string;
}

export async function authenticate(_: AuthState | undefined, formData: FormData): Promise<AuthState> {
  const expectedHash = getExpectedHash();
  const password = formData.get("password");

  if (!expectedHash) {
    return { success: false, message: "Studio admin key is not configured." };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { success: false, message: "Enter the admin key to continue." };
  }

  const providedHash = computeHash(password);
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const providedBuffer = Buffer.from(providedHash, "hex");

  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return { success: false, message: "Invalid admin key." };
  }

  const secure = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set(STUDIO_COOKIE_NAME, expectedHash, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/studio");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDIO_COOKIE_NAME);
  redirect("/studio");
}
