"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { assignRef } from "@lib/utils/assign-ref";
import { cn } from "@lib/utils/cn";

type ButtonVariant = "default" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

function buttonClasses(variant: ButtonVariant, size: ButtonSize): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variants: Record<ButtonVariant, string> = {
    default:
      "bg-gradient-to-br from-emerald-500/90 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:via-emerald-500 hover:to-emerald-500", // Subtle gradient to mimic premium UI.
    secondary: "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:bg-slate-50/10 dark:text-slate-50 dark:hover:bg-slate-50/20",
    ghost:
      "bg-transparent text-slate-900 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-slate-50/10",
    destructive:
      "bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/25 hover:from-rose-500 hover:via-rose-600 hover:to-rose-600",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, variant = "default", size = "md", loading = false, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={(node) => assignRef<HTMLButtonElement>(ref as unknown, node)}
      className={cn(buttonClasses(variant, size), className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <span
          className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-[2.5px] border-white/60 border-b-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";
