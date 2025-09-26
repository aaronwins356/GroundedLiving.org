import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  href: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={cn(styles.breadcrumbs, className)}>
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;
          return (
            <li key={item.href} aria-current={isCurrent ? "page" : undefined}>
              {isCurrent ? <span>{item.label}</span> : <Link href={item.href}>{item.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
