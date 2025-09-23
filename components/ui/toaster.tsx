"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { cn } from "@lib/utils/cn";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}

interface Toast extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  pushToast: (toast: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback(({ duration = 4000, ...toast }: ToastOptions) => {
    setToasts((current) => {
      const id = Date.now();
      const next = [...current, { id, ...toast, duration }];
      window.setTimeout(() => {
        setToasts((existing) => existing.filter((item) => item.id !== id));
      }, duration);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 px-5 py-4 text-sm shadow-xl backdrop-blur-lg transition dark:border-slate-800/60 dark:bg-slate-900/80",
              toast.variant === "success"
                ? "border-emerald-200/70 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-200"
                : null,
              toast.variant === "error"
                ? "border-rose-200/70 text-rose-700 dark:border-rose-500/30 dark:text-rose-200"
                : null,
            )}
          >
            <p className="font-semibold">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-slate-500 dark:text-slate-300">{toast.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
