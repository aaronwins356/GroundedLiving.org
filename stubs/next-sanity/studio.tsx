"use client";

import type { ReactNode } from "react";

interface NextStudioProps {
  config: unknown;
}

export function NextStudio({ config }: NextStudioProps): ReactNode {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Sanity Studio is unavailable in the offline build configuration.", config);
  }

  return (
    <div className="p-6 text-sm text-slate-600">
      Sanity Studio is disabled for this local content build.
    </div>
  );
}
