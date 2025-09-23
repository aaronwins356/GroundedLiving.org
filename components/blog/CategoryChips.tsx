import Link from "next/link";

import type { ContentfulCategory } from "../../types/contentful";

import styles from "./CategoryChips.module.css";

interface CategoryChipsProps {
  categories: ContentfulCategory[];
  activeSlug?: string;
}

export function CategoryChips({ categories, activeSlug }: CategoryChipsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Browse by category</span>
      <div className={styles.chips}>
        {categories.map((category) => {
          const isActive = activeSlug === category.slug;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`${styles.chip} ${isActive ? styles.active : ""}`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
