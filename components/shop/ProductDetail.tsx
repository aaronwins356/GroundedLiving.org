import Image from "next/image";
import Link from "next/link";

import { TrackEvent } from "@/components/analytics/TrackEvent";
import { Badge } from "@/components/ui/badge";
import { buttonClassNames } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/currency";
import type { ShopProduct } from "@project-types/shop";

interface ProductDetailProps {
  product: ShopProduct;
  checkoutUrl: string;
}

export function ProductDetail({ product, checkoutUrl }: ProductDetailProps) {
  const price = formatCurrency(product.priceCents, product.priceCurrency);
  const hasStorageNotes = Boolean(product.storageNotes);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:items-start">
      <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-ink/10 bg-white/80 shadow-[0_28px_84px_-40px_rgba(19,34,30,0.45)]">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 480px, 90vw"
          priority
        />
      </div>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-moss-700">
            <span className="font-semibold uppercase tracking-[0.3em] text-moss-600">Grounded Living Shop</span>
            <span aria-hidden className="text-moss-500">•</span>
            <span className="font-medium">SKU {product.sku}</span>
          </div>
          <h1 className="text-4xl font-semibold text-ink lg:text-5xl">{product.name}</h1>
          <p className="max-w-2xl text-lg text-ink/80">{product.longDescription}</p>
          <div className="flex flex-wrap items-center gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} variant="outline" className="border-moss/30 bg-moss/10 text-sm font-medium text-moss-700">
                {badge}
              </Badge>
            ))}
          </div>
        </header>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(19,34,30,0.45)]">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-ink/60">Price</p>
              <p className="text-2xl font-semibold text-ink">{price}</p>
            </div>
            {product.netWeight ? (
              <div>
                <p className="text-sm uppercase tracking-wide text-ink/60">Net weight</p>
                <p className="text-lg font-medium text-ink">{product.netWeight}</p>
              </div>
            ) : null}
          </div>
          <Link
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassNames({ size: "lg", className: "w-full justify-center text-base" })}
            data-analytics-action="checkout"
          >
            Checkout on Stripe
          </Link>
          <p className="text-sm text-ink/60">
            Secure checkout via Stripe. Taxes and live shipping rates (where applicable) are displayed before you submit your
            order.
          </p>
        </div>
        <section>
          <h2 className="text-xl font-semibold text-ink">How it helps</h2>
          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            {product.benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
                <dt className="font-semibold text-ink">{benefit.title}</dt>
                <dd className="mt-2 text-sm text-ink/70">{benefit.description}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-ink">Ingredients & materials</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient} className="flex items-start gap-2">
                  <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-moss-500" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">How to use</h2>
            <ul className="mt-4 space-y-4 text-sm text-ink/80">
              {product.usage.map((step) => (
                <li key={step.title}>
                  <p className="font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-ink/70">{step.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        {product.includes.length > 0 ? (
          <section>
            <h2 className="text-xl font-semibold text-ink">What&apos;s included</h2>
            <ul className="mt-4 grid gap-3 text-sm text-ink/80 md:grid-cols-2">
              {product.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-moss-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="grid gap-6 rounded-2xl border border-ink/10 bg-white/70 p-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Shipping & fulfillment</h2>
            <p className="mt-2 text-sm text-ink/70">{product.shippingNotes}</p>
          </div>
          {hasStorageNotes ? (
            <div>
              <h3 className="text-base font-semibold text-ink">Storage</h3>
              <p className="mt-2 text-sm text-ink/70">{product.storageNotes}</p>
            </div>
          ) : null}
          <div>
            <h3 className="text-base font-semibold text-ink">Safety disclaimer</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              {product.safetyNotes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-saffron-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <TrackEvent
        event="shop_product_viewed"
        params={{ sku: product.sku, slug: product.slug, price: product.priceCents / 100, currency: product.priceCurrency }}
      />
    </div>
  );
}
