import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tinted?: boolean;
}

export function Card({ className, tinted = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/60 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur-lg transition-colors dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none",
        tinted ? "bg-gradient-to-br from-emerald-50/90 via-white/80 to-white/70 dark:from-emerald-500/10 dark:via-slate-900/60 dark:to-slate-900/50" : null,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 px-8 py-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-8 pb-8", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-8 pb-6", className)} {...props} />;
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
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300/60 px-10 py-12 text-center dark:border-slate-700/60",
        className,
      )}
      {...props}
    >
      {icon ? <div className="text-emerald-500">{icon}</div> : null}
      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      {description ? <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    </div>
  );
}
