"use client";

import Script from "next/script";

type Props = {
  trackingId?: string;
};

export function GoogleAnalytics({ trackingId }: Props) {
  if (!trackingId) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
