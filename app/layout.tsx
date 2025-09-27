import Script from "next/script";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import seoConfig from "../next-seo.config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.groundedliving.org"),
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  openGraph: {
    type: "website",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: "https://www.groundedliving.org",
    siteName: "Grounded Living",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: seoConfig.defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preload" as="image" href="/images/recipes/moon-milk.svg" type="image/svg+xml" />
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            (function () {
              const storageKey = "gl-theme";
              try {
                const root = document.documentElement;
                const stored = window.localStorage.getItem(storageKey);
                const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const resolved = stored === "dark" || stored === "light" ? stored : systemPrefersDark ? "dark" : "light";
                root.dataset.theme = resolved;
                root.style.colorScheme = resolved === "dark" ? "dark" : "light";
              } catch (error) {
                document.documentElement.dataset.theme = "light";
                document.documentElement.style.colorScheme = "light";
              }
            })();
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
