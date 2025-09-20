import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.groundedliving.org"),
  title: {
    default: "Grounded Living – Mindful Health & Lifestyle",
    template: "%s | Grounded Living",
  },
  description: "Mindful health and lifestyle inspiration to help you live a grounded life.",
  openGraph: {
    type: "website",
    title: "Grounded Living – Mindful Health & Lifestyle",
    description: "Mindful health and lifestyle inspiration to help you live a grounded life.",
    url: "https://www.groundedliving.org",
    siteName: "Grounded Living",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Grounded Living – Mindful Health & Lifestyle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grounded Living – Mindful Health & Lifestyle",
    description: "Mindful health and lifestyle inspiration to help you live a grounded life.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="container-base flex-1 py-12">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
