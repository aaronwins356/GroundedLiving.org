import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Container<T extends ElementType = "div">({
  as,
  children,
  className,
  ...rest
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component className={cn("container", className)} {...rest}>
      {children}
    </Component>
  );
}
