import type { ReactNode } from "react";

import { SpeedInsights } from "@vercel/speed-insights/next";

import { GoogleAnalytics } from "../../components/analytics/GoogleAnalytics";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import { getPages } from "../../lib/contentful";
import styles from "../layout.module.css";

interface SiteLayoutProps {
  children: ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const pages = await getPages().catch((error) => {
    console.error("Failed to load Contentful pages", error);
    return [];
  });

  return (
    <div className={styles.body}>
      <div className={styles.radiance} aria-hidden />
      <Navbar pages={pages} />
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>
      <Footer />
      <GoogleAnalytics />
      <SpeedInsights />
    </div>
  );
}
