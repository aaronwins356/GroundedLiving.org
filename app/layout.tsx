/* eslint-disable @next/next/no-page-custom-font */
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";

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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap"
        />
      </head>
      <body className="bg-gradient-to-b from-white via-mist to-white text-accent">
        <div className="flex min-h-screen flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <div className="container-base py-16">
              {children}
              {/* Future banner ad placement retained for upcoming monetization experiments. */}
              {/** <div className="mt-12 h-24 rounded-3xl border border-dashed border-brand/30" /> */}
            </div>
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
