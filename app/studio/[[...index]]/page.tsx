"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

export default function StudioPage() {
  return (
    <section className="min-h-[70vh] overflow-hidden rounded-3xl bg-white shadow-soft-lg">
      <NextStudio config={config} />
    </section>
  );
}
