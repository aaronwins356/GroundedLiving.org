"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import { assignRef } from "@lib/utils/assign-ref";
import { cn } from "@lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={(node) => assignRef<HTMLSelectElement>(ref as unknown, node)}
      className={cn(
        "flex h-11 w-full appearance-none rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm shadow-sm transition focus:border-emerald-400 focus:shadow-emerald-200/40 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
