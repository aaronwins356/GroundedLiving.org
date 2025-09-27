"use client";

import { useCallback, useEffect, useMemo, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type RevealProps<T extends ElementType = "div"> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Reveal<T extends ElementType = "div">({
  as,
  children,
  className,
  delay = 0,
  once = true,
  style,
  ...rest
}: RevealProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const nodeRef = useRef<HTMLElement | null>(null);

  const setNodeRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      element.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-revealed");
          if (once) {
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  const computedStyle = useMemo(() => {
    if (!delay) {
      return style;
    }

    const baseStyle = style ? { ...style } : ({} as ComponentPropsWithoutRef<T>["style"]);
    return { ...baseStyle, transitionDelay: `${delay}ms` } as ComponentPropsWithoutRef<T>["style"];
  }, [delay, style]);

  return (
    <Component
      ref={setNodeRef as never}
      className={cn("reveal", className)}
      style={computedStyle}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Component>
  );
}
