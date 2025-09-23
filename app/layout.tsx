/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SpeedInsights } from "@vercel/speed-insights/next";

import { GoogleAnalytics } from "../components/analytics/GoogleAnalytics";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { getPages } from "../lib/contentful";
import seoConfig from "../next-seo.config";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.groundedliving.org"),
  title: {
    default: seoConfig.defaultTitle,
    template: "%s | Grounded Living",
  },
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pages = await getPages().catch((error) => {
    console.error("Failed to load Contentful pages", error);
    return [];
  });

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className={styles.body}>
        <div className={styles.radiance} aria-hidden />
        <Navbar pages={pages} />
        <main className={styles.main}>
          <div className={styles.inner}>{children}</div>
        </main>
        <Footer />
        <GoogleAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
