"use client";

import Script from "next/script";
import { memo } from "react";
import type { ComponentProps } from "react";

const SPEED_INSIGHTS_SCRIPT_SRC = "https://speed-insights.vercel.app/script.js";

type ScriptProps = ComponentProps<typeof Script>;

export type SpeedInsightsProps = Omit<ScriptProps, "id" | "src"> & {
  /**
   * Optional override for the script source. Defaults to the hosted Vercel script.
   * This makes it possible to self-host if necessary while preserving instrumentation.
   */
  src?: string;
};

/**
 * Lightweight fallback implementation of `@vercel/speed-insights/next` that mirrors the
 * public package API closely enough for local development when direct npm access is
 * unavailable in CI. The component injects the official Speed Insights script so Vercel can
 * capture performance telemetry automatically.
 */
export const SpeedInsights = memo(function SpeedInsights({ src, ...rest }: SpeedInsightsProps) {
  return (
    <Script
      id="vercel-speed-insights"
      src={src ?? SPEED_INSIGHTS_SCRIPT_SRC}
      strategy="afterInteractive"
      {...rest}
    />
  );
});
