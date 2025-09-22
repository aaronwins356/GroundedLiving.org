"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";
import styles from "./page.module.css";

export default function StudioPage() {
  return (
    <section className={styles.shell}>
      <NextStudio config={config} />
    </section>
  );
}
