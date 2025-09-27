import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full border font-semibold tracking-wide transition-colors transition-transform duration-subtle ease-[cubic-bezier(0.33,1,0.68,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-moss-500 disabled:cursor-not-allowed disabled:opacity-75 motion-safe:will-change-transform motion-safe:hover:-translate-y-[1px] motion-safe:hover:scale-[1.015] motion-safe:active:translate-y-0 motion-safe:active:scale-100";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-moss-600 px-5 text-stone-50 shadow-sm shadow-moss-900/20 hover:bg-moss-700 hover:shadow focus-visible:ring-offset-surface-canvas",
  secondary:
    "border-[color:var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-5 text-[color:var(--button-secondary-color)] hover:border-[color:var(--button-secondary-border-hover)] hover:bg-[color:var(--button-secondary-hover-bg)] focus-visible:ring-offset-surface-canvas",
  ghost:
    "border-transparent bg-transparent px-4 text-[color:var(--color-ink)] hover:bg-[color:var(--button-ghost-hover)] focus-visible:ring-offset-surface-canvas",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClassNames({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const computedDisabled = disabled ?? loading;

  return (
    <button
      className={buttonClassNames({ variant, size, className })}
      disabled={computedDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}
