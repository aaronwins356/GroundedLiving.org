/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import type { ReactNode } from "react";

import seoConfig from "../next-seo.config";
import "./globals.css";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
