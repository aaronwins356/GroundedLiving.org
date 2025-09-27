import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "moss" | "linen";
  interactive?: boolean;
}

const toneClasses: Record<NonNullable<CardProps["tone"]>, string> = {
  default:
    "border-ink/8 bg-white/85 shadow-[0_28px_84px_-48px_rgba(19,34,30,0.45)] backdrop-blur-sm",
  moss: "border-moss-200/50 bg-moss-50/85 text-ink shadow-[0_24px_72px_-48px_rgba(91,127,107,0.45)]",
  linen: "border-stone-200/60 bg-stone-50/88 text-ink shadow-[0_20px_68px_-48px_rgba(38,33,28,0.35)]",
};

export function Card({ className, tone = "default", interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "group/card relative flex flex-col rounded-3xl border transition-all duration-subtle",
        toneClasses[tone],
        interactive
          ? "hover:-translate-y-1 hover:shadow-[0_36px_96px_-56px_rgba(19,34,30,0.55)] focus-within:-translate-y-1 focus-within:shadow-[0_36px_96px_-56px_rgba(19,34,30,0.55)]"
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
