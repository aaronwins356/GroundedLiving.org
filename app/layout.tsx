/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-[#fdf8f3] text-accent">
        <div className="relative flex min-h-screen flex-col font-sans">
          {/* Radial wash recreates the soft vignette from the Healing Soulfully inspiration while staying lightweight. */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(107,144,128,0.16),_transparent_58%)]" aria-hidden />
          <Navbar />
          <main className="relative flex-1 pb-24">
            <div className="container-base relative py-16">
              {children}
              {/* Reserving space for future monetization modules keeps layout planning visible in design discussions. */}
              {/** <div className="mt-12 h-24 rounded-3xl border border-dashed border-brand/30" /> */}
            </div>
          </main>
          <Footer />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
