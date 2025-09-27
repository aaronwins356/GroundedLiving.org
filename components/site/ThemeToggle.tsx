"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

import { useTheme } from "@/components/site/ThemeProvider";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className={cn(
        "theme-toggle",
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--button-secondary-border)] bg-[color:var(--surface-subtle)] text-[color:var(--color-ink)] transition-transform duration-subtle ease-[cubic-bezier(0.33,1,0.68,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-moss-500",
        className,
      )}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={label}
      title={label}
    >
      <span className="sr-only">{label}</span>
      <SunMedium
        aria-hidden
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          hasMounted && isDark ? "scale-50 opacity-0" : "scale-100 opacity-100",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          hasMounted && isDark ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
    </button>
  );
}
