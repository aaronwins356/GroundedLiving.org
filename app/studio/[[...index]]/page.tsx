"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

export default function StudioPage() {
  return (
    <section className="min-h-[70vh] overflow-hidden rounded-[2.5rem] bg-white/90 shadow-soft-lg ring-1 ring-brand-100">
      <NextStudio config={config} />
    </section>
  );
}
