import type { ReactNode } from "react";

import { SpeedInsights } from "@vercel/speed-insights/next";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Fraunces, Inter } from "next/font/google";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontClasses = `${displayFont.className} ${bodyFont.className}`;
const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;
const displayFontFamily = displayFont.style?.fontFamily ?? "inherit";
const bodyFontFamily = bodyFont.style?.fontFamily ?? "inherit";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className={`${fontClasses} ${fontVariables}`}>
      <style>{`:root{--font-display:${displayFontFamily};--font-body:${bodyFontFamily};}`}</style>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="content" className="site-main" role="main">
        {children}
      </main>
      <Footer />
      <GoogleAnalytics />
      <SpeedInsights />
    </div>
  );
}
