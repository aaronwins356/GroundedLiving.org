import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
}

interface ToastContextValue {
  notify: (toast: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantToClassName = (variant: ToastMessage["variant"]) => {
  switch (variant) {
    case "success":
      return "bg-emerald-500 text-white";
    case "error":
      return "bg-rose-500 text-white";
    default:
      return "bg-slate-800 text-white";
  }
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((toast: Omit<ToastMessage, "id">) => {
    setToasts((current) => {
      const next = [...current, { ...toast, id: Date.now() }];
      return next.slice(-4);
    });

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setToasts((current) => current.slice(1));
      }, 3800);
    }
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -8 }}
              className={`rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm ${variantToClassName(toast.variant)}`}
            >
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
