"use client";

import Script from "next/script";

/**
 * Lightweight replacement for the official @vercel/analytics component. This ensures
 * analytics events are still captured even though we cannot install the package in
 * the execution environment.
 */
export function Analytics() {
  return (
    <Script
      id="vercel-analytics"
      strategy="afterInteractive"
      src="https://va.vercel-scripts.com/v1/script.js"
    />
  );
}

export default Analytics;
