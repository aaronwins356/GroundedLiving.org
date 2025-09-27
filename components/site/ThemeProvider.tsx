"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  useSystemPreference: () => void;
  isSystemPreference: boolean;
}

const STORAGE_KEY = "gl-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
}

function readStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function resolveSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    const current = document.documentElement.dataset.theme;
    return current === "dark" ? "dark" : "light";
  });
  const [isSystemPreference, setSystemPreference] = useState<boolean>(() => readStoredTheme() === null);

  useEffect(() => {
    const storedTheme = readStoredTheme();
    const systemTheme = resolveSystemTheme();
    const resolved = storedTheme ?? systemTheme;
    setThemeState(resolved);
    applyTheme(resolved);
    setSystemPreference(storedTheme === null);

    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme() !== null) {
        return;
      }
      const next = event.matches ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
      setSystemPreference(true);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    setSystemPreference(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const useSystemPreference = useCallback(() => {
    const systemTheme = resolveSystemTheme();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setSystemPreference(true);
    setThemeState(systemTheme);
    applyTheme(systemTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme, useSystemPreference, isSystemPreference }),
    [theme, toggleTheme, setTheme, useSystemPreference, isSystemPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
