"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { assignRef } from "@lib/utils/assign-ref";
import { cn } from "@lib/utils/cn";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  className?: string;
  inputClassName?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, inputClassName, ...props },
  ref,
) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center", className)}>
      <input
        ref={(node) => assignRef<HTMLInputElement>(ref as unknown, node)}
        type="checkbox"
        className={cn("peer sr-only", inputClassName)}
        {...props}
      />
      <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition peer-checked:bg-emerald-500 dark:bg-slate-700">
        <span className="absolute left-1 inline-flex h-4 w-4 translate-x-0 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
});

Switch.displayName = "Switch";
