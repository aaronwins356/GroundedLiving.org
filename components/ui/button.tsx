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

  // const variants: Record<ButtonVariant, string> = {
  const variants: Record<ButtonVariant, string> = {
    // Primary call‑to‑action buttons now use an earthy green gradient with soft
    // shadowing. These colours reference the refreshed palette in globals.css.
    default:
      "bg-gradient-to-br from-[#a6bfa0] via-[#94b08c] to-[#6f8462] text-white shadow-md shadow-[#6f846266] hover:from-[#a6bfa0] hover:via-[#8fae81] hover:to-[#6f8462]", // Gentle gradient inspired by nature.
    // Secondary buttons feature a neutral tan background with dark text and a
    // subtle lift on hover.
    secondary:
      "bg-[#eae0d4] text-[#564a3f] hover:bg-[#e3d5c6] dark:bg-[#eae0d4] dark:text-[#564a3f] dark:hover:bg-[#dcd0c2]",
    // Ghost buttons remain transparent but use the new accent colour for text and
    // hover background.
    ghost:
      "bg-transparent text-[#6f8462] hover:bg-[#f4e2d8]/60 dark:text-[#cddcc7] dark:hover:bg-[#f4e2d8]/20",
    // Destructive actions retain a red gradient but with softer shadows.
    destructive:
      "bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-md shadow-rose-500/30 hover:from-rose-500 hover:via-rose-600 hover:to-rose-600",
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
