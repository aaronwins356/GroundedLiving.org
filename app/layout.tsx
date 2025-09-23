import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Lato } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const bodyFont = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.groundedliving.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Grounded Living | Soulful Wellness for Everyday Rituals",
    template: "%s | Grounded Living",
  },
  description:
    "Grounded Living is a sanctuary for gentle rituals, nourishing recipes, and soul-led reflections that help you bloom with intention.",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Grounded Living | Soulful Wellness for Everyday Rituals",
    description:
      "Explore mindful practices, heartfelt stories, and plant-forward nourishment crafted to help you feel grounded and luminous.",
    siteName: "Grounded Living",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grounded Living",
    description:
      "Explore mindful practices, heartfelt stories, and plant-forward nourishment crafted to help you feel grounded and luminous.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pt-24 lg:pt-28">{children}</main>
          <Footer />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
