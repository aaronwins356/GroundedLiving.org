import React, { ReactNode, useMemo } from "react";

export type MotionStyle = Record<string, unknown> | undefined;

export interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: MotionStyle;
  animate?: MotionStyle;
  exit?: MotionStyle;
  transition?: {
    duration?: number;
    delay?: number;
  };
  children?: ReactNode;
}

const merge = (base: MotionStyle, next: MotionStyle): MotionStyle => {
  if (!base) {
    return next;
  }

  if (!next) {
    return base;
  }

  return { ...base, ...next };
};

const applyTransition = (style: MotionStyle, transition: MotionProps["transition"]): MotionStyle => {
  if (!transition) {
    return style;
  }

  const existing = (style ?? {}) as Record<string, unknown>;
  return {
    ...existing,
    transition: `all ${transition.duration ?? 0.25}s cubic-bezier(0.22, 0.61, 0.36, 1) ${transition.delay ?? 0}s`,
  };
};

const MotionDiv = ({ initial, animate, transition, style, children, ...rest }: MotionProps) => {
  const computedStyle = useMemo(() => {
    const base = style ? { ...(style as unknown as Record<string, unknown>) } : undefined;
    const merged = merge(merge(base, initial), animate);
    return applyTransition(merged, transition);
  }, [style, initial, animate, transition]);

  return (
    <div style={computedStyle as React.CSSProperties} {...rest}>
      {children}
    </div>
  );
};

export const motion = {
  div: MotionDiv,
};

export interface AnimatePresenceProps {
  children: ReactNode;
}

export const AnimatePresence = ({ children }: AnimatePresenceProps) => <>{children}</>;

export default motion;
