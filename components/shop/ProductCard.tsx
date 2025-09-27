import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ShopProduct } from "@project-types/shop";
import { formatCurrency } from "@/lib/utils/currency";

interface ProductCardProps {
  product: ShopProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = formatCurrency(product.priceCents, product.priceCurrency);

  return (
    <li className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white/90 shadow-[0_24px_60px_-30px_rgba(19,34,30,0.4)] transition hover:-translate-y-1 hover:shadow-[0_32px_80px_-36px_rgba(19,34,30,0.35)]">
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[5/4] w-full">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 420px, (min-width: 768px) 45vw, 90vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} variant="outline" className="border-moss/30 bg-moss/10 text-sm font-medium text-moss-700">
                {badge}
              </Badge>
            ))}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-ink transition group-hover:text-moss-700">{product.name}</h3>
            <p className="mt-2 text-base text-ink/70">{product.tagline}</p>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="text-lg font-semibold text-ink">{price}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-moss-700">
              Shop the ritual
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
