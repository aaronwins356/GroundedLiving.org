import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";

interface ArticleShellProps {
  children: ReactNode;
  className?: string;
}

export function ArticleShell({ children, className }: ArticleShellProps) {
  return (
    <Container className={cn("article-shell", className)} as="article">
      <div className="prose">{children}</div>
    </Container>
  );
}
