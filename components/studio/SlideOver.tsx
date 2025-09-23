import React from "react";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SlideOverProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const SlideOver = ({ title, description, isOpen, onClose, children }: SlideOverProps) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div
        className="fixed inset-0 z-40 flex items-end justify-center md:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-slate-900/70" onClick={onClose} aria-hidden="true" />
        <motion.div
          className="relative w-full max-w-2xl translate-y-0 overflow-hidden rounded-3xl bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl md:translate-y-0"
          initial={{ opacity: 0, translateY: 60 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 40 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
        >
          <header className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              {description ? <p className="mt-1 max-w-xl text-sm text-slate-300">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </header>
          <div className="mt-6">{children}</div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
