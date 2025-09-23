import type { HTMLAttributes } from "react";

import { cn } from "@lib/utils/cn";

type BadgeVariant = "default" | "outline" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-900/90 text-white dark:bg-slate-100/90 dark:text-slate-900",
  outline: "border border-slate-300/80 text-slate-600 dark:border-slate-700/80 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
