import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionProps<T extends ElementType = "section"> = {
  as?: T;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Section<T extends ElementType = "section">({
  as,
  children,
  className,
  ...rest
}: SectionProps<T>) {
  const Component = (as ?? "section") as ElementType;

  return (
    <Component className={cn("section", className)} {...rest}>
      {children}
    </Component>
  );
}
