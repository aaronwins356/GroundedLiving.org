import type { DefaultSeoProps } from "next-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.groundedliving.org";

const config: DefaultSeoProps = {
  titleTemplate: "%s | Grounded Living",
  defaultTitle: "Grounded Living | Soulful Wellness for Everyday Rituals",
  description:
    "Gentle wellness rituals, grounded business advice, and plant-forward nourishment to help you lead with intention.",
  canonical: siteUrl,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Grounded Living",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "Grounded Living",
      },
    ],
  },
  twitter: {
    handle: "@groundedliving",
    site: "@groundedliving",
    cardType: "summary_large_image",
  },
};

export default config;
