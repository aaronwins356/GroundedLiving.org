import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SpeedInsights } from "@vercel/speed-insights/next";

import { Gtag } from "@/components/analytics/Gtag";
import { JsonLd } from "@/components/seo/JsonLd";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { NewsletterRibbon } from "@/components/site/NewsletterRibbon";
import { bodyFontLocal, displayFontLocal, fallbackFontFamilies } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import { websiteSchema } from "@/lib/seo/schema";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ConsentProvider } from "@/context/ConsentContext";
import seoConfig from "../../next-seo.config";

const disableFontDownloads =
  process.env.NEXT_DISABLE_FONT_DOWNLOADS === "1" || process.env.NODE_ENV !== "production";

const { displayFont: activeDisplayFont, bodyFont: activeBodyFont } = await (async () => {
  if (disableFontDownloads) {
    return { displayFont: displayFontLocal, bodyFont: bodyFontLocal };
  }

  const { Fraunces, Inter } = await import("next/font/google");
  const displayFontRemote = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
  });
  const bodyFontRemote = Inter({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
  });

  return { displayFont: displayFontRemote, bodyFont: bodyFontRemote };
})();

const fontClasses = [activeDisplayFont.className, activeBodyFont.className]
  .filter(Boolean)
  .join(" ");
const fontVariables = [activeDisplayFont.variable, activeBodyFont.variable]
  .filter(Boolean)
  .join(" ");
const displayFontFamily =
  activeDisplayFont.style?.fontFamily ?? fallbackFontFamilies.display;
const bodyFontFamily =
  activeBodyFont.style?.fontFamily ?? fallbackFontFamilies.body;

const googleVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const websiteJsonLd = websiteSchema({
  name: "Grounded Living",
  url: siteUrl.toString(),
  searchUrl: `${new URL("/search", siteUrl).toString()}?q=`,
});

export const metadata = {
  metadataBase: siteUrl,
  title: {
    default: seoConfig.defaultTitle,
    template: "%s | Grounded Living",
  },
  description: seoConfig.defaultDescription,
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
} satisfies Metadata;

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <ConsentProvider>
      <div className={`${fontClasses} ${fontVariables}`}>
        <style>{`:root{--font-display:${displayFontFamily};--font-body:${bodyFontFamily};}`}</style>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="content" className="site-main" role="main">
          {children}
        </main>
        <NewsletterRibbon />
        <Footer />
        <ConsentBanner />
        <Gtag />
        <SpeedInsights />
        <JsonLd item={websiteJsonLd} id="website-schema" />
      </div>
    </ConsentProvider>
  );
}
