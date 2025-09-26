import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

export interface CalloutProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export function Callout({ className, ...rest }: CalloutProps) {
  return <div className={cn("callout", className)} {...rest} />;
}
