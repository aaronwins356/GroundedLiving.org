import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "moss" | "linen";
  interactive?: boolean;
}

const toneClasses: Record<NonNullable<CardProps["tone"]>, string> = {
  default:
    "border-[color:var(--card-border-default)] bg-[var(--card-bg-default)] text-ink shadow-[var(--card-shadow-default)] backdrop-blur-sm",
  moss: "border-[color:var(--card-border-moss)] bg-[var(--card-bg-moss)] text-ink shadow-[var(--card-shadow-moss)]",
  linen: "border-[color:var(--card-border-linen)] bg-[var(--card-bg-linen)] text-ink shadow-[var(--card-shadow-linen)]",
};

export function Card({ className, tone = "default", interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "group/card relative flex flex-col rounded-3xl border transition-transform transition-colors duration-subtle ease-[cubic-bezier(0.33,1,0.68,1)]",
        "motion-safe:will-change-transform",
        toneClasses[tone],
        interactive
          ? "motion-safe:hover:-translate-y-[6px] motion-safe:focus-within:-translate-y-[6px] hover:shadow-[0_36px_96px_-56px_rgba(19,34,30,0.55)] focus-within:shadow-[0_36px_96px_-56px_rgba(19,34,30,0.55)]"
          : null,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3 px-8 pb-4 pt-8", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-xl font-semibold text-ink", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-ink-soft", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-4 px-8 pb-8", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-8 pb-8", className)} {...props} />;
}

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function CardEmptyState({ icon, title, description, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/12 bg-surface-subtle/70 px-10 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? <div className="text-moss-500">{icon}</div> : null}
      <h4 className="text-lg font-semibold text-ink">{title}</h4>
      {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
    </div>
  );
}
