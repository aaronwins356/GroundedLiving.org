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
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
