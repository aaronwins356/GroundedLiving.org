import type { ComponentType } from "react";

interface NextStudioProps {
  config: unknown;
}

const NextStudio: ComponentType<NextStudioProps> = () => {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-100 text-center text-sm text-slate-600">
      Sanity Studio is unavailable in the offline build preview.
    </div>
  );
};

export { NextStudio };
