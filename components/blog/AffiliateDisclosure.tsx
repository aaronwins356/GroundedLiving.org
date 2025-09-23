import styles from "./AffiliateDisclosure.module.css";

interface AffiliateDisclosureProps {
  ctaText?: string | null;
  ctaUrl?: string | null;
}

export function AffiliateDisclosure({ ctaText, ctaUrl }: AffiliateDisclosureProps) {
  return (
    <aside className={styles.wrapper}>
      <div className={styles.content}>
        <h4>Affiliate note</h4>
        <p>
          This article may contain affiliate links. If you purchase through these links we may earn a small commission at no
          additional cost to you. Thank you for supporting our slow living research and wellness experiments.
        </p>
        {ctaText && ctaUrl ? (
          <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className={styles.cta}>
            {ctaText}
          </a>
        ) : null}
      </div>
    </aside>
  );
}
