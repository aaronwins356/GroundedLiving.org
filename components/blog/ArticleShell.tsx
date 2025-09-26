import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";

interface ArticleShellProps {
  children: ReactNode;
  className?: string;
  /**
   * Allows callers to override the inner wrapper styling when ArticleShell
   * needs to render inside another `.prose` context (for example CMS-driven pages).
   */
  innerClassName?: string;
}

export function ArticleShell({ children, className, innerClassName = "prose" }: ArticleShellProps) {
  return (
    <Container className={cn("article-shell", className)} as="article">
      <div className={innerClassName}>{children}</div>
    </Container>
  );
}
