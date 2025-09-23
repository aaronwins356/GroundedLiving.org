import type { LabelHTMLAttributes } from "react";

import { cn } from "@lib/utils/cn";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-slate-600 transition-colors dark:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}
