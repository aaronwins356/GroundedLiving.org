const DEFAULT_CURRENCY = "USD" as const;

/**
 * Formats an integer price (stored in cents) into a locale aware currency string.
 * We centralize the implementation so PDPs, cards, and analytics payloads stay consistent.
 */
export function formatCurrency(priceCents: number, currency: string = DEFAULT_CURRENCY): string {
  const price = priceCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
