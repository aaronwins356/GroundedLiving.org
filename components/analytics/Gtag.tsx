"use client";

import { useEffect } from "react";
import Script from "next/script";

import { useConsent } from "@/context/ConsentContext";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export function Gtag() {
  const { preferences, status } = useConsent();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (status !== "ready") {
      return;
    }

    const consent = window.__glConsent ?? { analytics: false, ads: false, necessary: true, version: "v1" };
    consent.analytics = preferences.analytics;
    consent.ads = preferences.ads;
    window.__glConsent = consent;
  }, [preferences.analytics, preferences.ads, status]);

  if (!GA_ID || status !== "ready" || !preferences.analytics) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'update', {
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            ad_storage: 'denied',
            analytics_storage: 'granted'
          });
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
