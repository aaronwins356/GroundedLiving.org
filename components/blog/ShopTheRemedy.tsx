import { ShopTheRemedyCta } from "@/components/blog/ShopTheRemedyCta";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { formatCurrency } from "@/lib/utils/currency";
import type { ShopProduct } from "@project-types/shop";

interface ShopTheRemedyProps {
  product: ShopProduct;
  articleSlug: string;
}

export function ShopTheRemedy({ product, articleSlug }: ShopTheRemedyProps) {
  const price = formatCurrency(product.priceCents, product.priceCurrency);

  return (
    <aside className="not-prose mt-12 rounded-3xl border border-moss/15 bg-moss/5 p-8 shadow-[0_32px_80px_-48px_rgba(19,34,30,0.45)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss-600">Shop the remedy</p>
          <h3 className="text-2xl font-semibold text-ink">{product.name}</h3>
          <p className="text-base text-ink/70">{product.shortDescription}</p>
          <ul className="grid gap-3 text-sm text-ink/70 md:grid-cols-2">
            {product.benefits.slice(0, 2).map((benefit) => (
              <li key={benefit.title} className="flex gap-2">
                <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-moss-500" />
                <span>
                  <strong className="text-ink">{benefit.title}.</strong> {benefit.description}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-ink">{price}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <ShopTheRemedyCta href={`/shop/${product.slug}`} productName={product.name} postSlug={articleSlug} />
          <p className="text-xs text-ink/60">
            Ships via Stripe checkout. Taxes and shipping calculated at payment.
          </p>
        </div>
      </div>
      <TrackEvent event="shop_module_viewed" params={{ product: product.slug, post: articleSlug }} />
    </aside>
  );
}
