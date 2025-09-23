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
          <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-6 sm:px-8">
            <div className="absolute inset-x-10 top-20 hidden h-[480px] rounded-full bg-gradient-to-br from-emerald-400/30 via-rose-300/20 to-slate-100/10 blur-3xl dark:from-emerald-500/10 dark:via-emerald-400/5 dark:to-transparent lg:block" />
            <div className="relative flex flex-1 flex-col">{children}</div>
          </div>
        </div>
      </ToastProvider>
    </StudioThemeProvider>
  );
}
