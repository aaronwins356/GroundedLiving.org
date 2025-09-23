"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { assignRef } from "@lib/utils/assign-ref";
import { cn } from "@lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, wrapperClassName, leadingIcon, trailingIcon, type = "text", ...props },
  ref,
) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm shadow-sm transition focus-within:border-emerald-400 focus-within:shadow-emerald-200/40 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-50",
        wrapperClassName,
      )}
    >
      {leadingIcon ? <span className="text-slate-400 group-focus-within:text-emerald-500">{leadingIcon}</span> : null}
      <input
        ref={(node) => assignRef<HTMLInputElement>(ref as unknown, node)}
        type={type}
        className={cn("flex-1 bg-transparent outline-none placeholder:text-slate-400", className)}
        {...props}
      />
      {trailingIcon ? <span className="text-slate-400 group-focus-within:text-emerald-500">{trailingIcon}</span> : null}
    </div>
  );
});

Input.displayName = "Input";
