"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type StudioTheme = "light" | "dark";

interface StudioThemeContextValue {
  theme: StudioTheme;
  setTheme: (theme: StudioTheme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "studio-theme";

const StudioThemeContext = createContext<StudioThemeContextValue | null>(null);

function applyTheme(theme: StudioTheme) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.dataset.studioTheme = theme;
}

export function StudioThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<StudioTheme>("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as StudioTheme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyTheme(stored);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }, []);

  const setTheme = useCallback((next: StudioTheme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>;
}

export function useStudioTheme() {
  const context = useContext(StudioThemeContext);
  if (!context) {
    throw new Error("useStudioTheme must be used within StudioThemeProvider");
  }
  return context;
}
