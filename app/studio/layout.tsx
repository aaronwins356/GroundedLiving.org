import type { ReactNode } from "react";

import { ToastProvider } from "../../components/ui/toaster";
import { StudioThemeProvider } from "./theme-provider";

export const metadata = {
  title: "Grounded Living Studio",
  description: "Manage blog posts, pages, and authors from a cohesive editorial workspace.",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <StudioThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#f5f1eb] via-[#f3ede7] to-[#e2f1e7] text-slate-900 transition-colors duration-500 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
          <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col overflow-hidden px-4 py-6 sm:px-8">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
              <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-rose-300/20 blur-3xl dark:bg-emerald-400/10" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/60 via-transparent to-transparent dark:from-slate-900/70" />
              <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,#1f2937_1px,transparent_0)] [background-size:40px_40px] dark:opacity-[0.07]" />
            </div>
            <div className="relative flex flex-1 flex-col">{children}</div>
          </div>
        </div>
      </ToastProvider>
    </StudioThemeProvider>
  );
}
