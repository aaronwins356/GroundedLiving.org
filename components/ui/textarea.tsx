"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { assignRef } from "@lib/utils/assign-ref";
import { cn } from "@lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={(node) => assignRef<HTMLTextAreaElement>(ref as unknown, node)}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm transition focus:border-emerald-400 focus:shadow-emerald-200/40 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-50",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
