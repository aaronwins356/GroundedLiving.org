import type { SVGProps } from "react";

import { cn } from "@/lib/utils/cn";

interface LogoProps {
  variant?: "horizontal" | "stacked" | "mark";
  className?: string;
  showTagline?: boolean;
}

const LEAF_PRIMARY = "#3D574A";
const LEAF_SECONDARY = "#8AB794";
const ACCENT = "#C58A2F";

function HerbMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 72 72"
      role="img"
      aria-hidden
      className={cn("inline-block", className)}
      {...props}
    >
      <title>Grounded Living leaf motif</title>
      <defs>
        <linearGradient id="leaf-gradient" x1="12%" y1="8%" x2="84%" y2="92%">
          <stop offset="0%" stopColor={LEAF_SECONDARY} stopOpacity="0.92" />
          <stop offset="100%" stopColor={LEAF_PRIMARY} />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
        <path
          d="M15.5 42.4c10.2-4.6 18.3-13 23-23 4.8-10 17.5-11.3 23.5-4.4 6 6.9 2.6 18.7-7.3 23.9-9.9 5.2-19.5 16.6-21.8 27.9"
          stroke="url(#leaf-gradient)"
        />
        <path
          d="M14.6 43.4c4.1 11.3 13.2 17.3 20.2 19.7"
          stroke={LEAF_PRIMARY}
        />
        <circle cx="16.8" cy="42.2" r="6.6" fill={ACCENT} stroke={ACCENT} />
      </g>
    </svg>
  );
}

export function Logo({ variant = "horizontal", className, showTagline = false }: LogoProps) {
  if (variant === "mark") {
    return <HerbMark className={cn("h-10 w-10", className)} />;
  }

  if (variant === "stacked") {
    return (
      <div className={cn("inline-flex flex-col items-center gap-3 text-center", className)}>
        <HerbMark className="h-14 w-14" />
        <div className="space-y-2">
          <span className="block font-display text-2xl tracking-tight text-ink">Grounded Living</span>
          {showTagline ? (
            <span className="block text-xs font-semibold uppercase tracking-[0.42em] text-ink-subtle">
              Holistic rituals &amp; nourishment
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <HerbMark className="h-11 w-11" />
      <span className="flex flex-col">
        <span className="font-display text-xl tracking-tight text-ink md:text-2xl">Grounded Living</span>
        {showTagline ? (
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-ink-subtle">
            Calm, credible wellness
          </span>
        ) : null}
      </span>
    </span>
  );
}

export { HerbMark as LogoMark };
