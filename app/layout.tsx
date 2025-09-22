/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.groundedliving.org"),
  title: {
    default: "Grounded Living – Soulful Wellness & Lifestyle",
    template: "%s | Grounded Living",
  },
  description:
    "Soulful wellness rituals, nourishing recipes, and mindful lifestyle guidance to help you feel grounded every day.",
  openGraph: {
    type: "website",
    title: "Grounded Living – Soulful Wellness & Lifestyle",
    description:
      "Soulful wellness rituals, nourishing recipes, and mindful lifestyle guidance to help you feel grounded every day.",
    url: "https://www.groundedliving.org",
    siteName: "Grounded Living",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Grounded Living – Soulful Wellness & Lifestyle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grounded Living – Soulful Wellness & Lifestyle",
    description:
      "Soulful wellness rituals, nourishing recipes, and mindful lifestyle guidance to help you feel grounded every day.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
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
        <Navbar />
        <main className={styles.main}>
          <div className={styles.inner}>{children}</div>
        </main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
