import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { ProductCard } from "@/components/shop/ProductCard";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getAllProducts } from "@/lib/shop/products";
import { canonicalFor } from "@/lib/seo/meta";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";
import { ogImageForTitle } from "@/lib/seo/og";

const PAGE_TITLE = "Homemade Remedies";
const PAGE_DESCRIPTION =
  "Small-batch remedies and digital rituals crafted by the Grounded Living team. Secure checkout, thoughtful sourcing, and gentle disclaimers for every product.";
const META_TITLE = buildMetaTitle(PAGE_TITLE);
const META_DESCRIPTION = truncateAtBoundary(PAGE_DESCRIPTION, 155);

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: canonicalFor("/shop").toString(),
  },
  openGraph: {
    type: "website",
    url: canonicalFor("/shop").toString(),
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: [
      {
        url: ogImageForTitle(PAGE_TITLE, {
          variant: "commerce",
          subtitle: PAGE_DESCRIPTION,
          eyebrow: "Shop",
          tag: "Future Commerce",
        }),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: [
      ogImageForTitle(PAGE_TITLE, {
        variant: "commerce",
        subtitle: PAGE_DESCRIPTION,
        eyebrow: "Shop",
        tag: "Future Commerce",
      }),
    ],
  },
};

const DISCLAIMER_TEXT =
  "The remedies below are educational in nature and do not replace professional medical advice, diagnosis, or treatment.";

export default function ShopPage() {
  const products = getAllProducts();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: PAGE_TITLE,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: canonicalFor(`/shop/${product.slug}`).toString(),
    })),
  } as const;

  return (
    <>
      <JsonLd item={itemList} id="shop-item-list" />
      <Section className="pb-16 pt-12 md:pt-16">
        <Container className="space-y-12">
          <Reveal as="header" className="space-y-5 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-moss-600">Grounded Living Shop</p>
            <h1 className="text-4xl font-semibold text-ink md:text-5xl">{PAGE_TITLE}</h1>
            <p className="mx-auto max-w-2xl text-lg text-ink/80 md:mx-0">{PAGE_DESCRIPTION}</p>
            <p className="mx-auto max-w-2xl text-sm text-ink/60 md:mx-0">{DISCLAIMER_TEXT}</p>
          </Reveal>
          <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ul>
          <Reveal
            as="div"
            className="rounded-3xl border border-[color:var(--card-border-default)] bg-[var(--card-bg-default)] p-6 text-sm text-ink/70 shadow-[var(--card-shadow-default)]"
          >
            <h2 className="text-base font-semibold text-ink">Transparency quick facts</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <strong className="text-ink">Checkout:</strong> Stripe handles payment, tax calculation, and shipping labels.
              </li>
              <li>
                <strong className="text-ink">Fulfillment:</strong> Physical remedies ship from our Portland, OR studio in recyclable packaging; digital products deliver instantly.
              </li>
              <li>
                <strong className="text-ink">Questions:</strong> Email <a className="underline" href="mailto:hello@groundedliving.org">hello@groundedliving.org</a> for sourcing or contraindication clarifications.
              </li>
            </ul>
          </Reveal>
        </Container>
      </Section>
      <TrackEvent event="shop_index_viewed" params={{ product_count: products.length }} />
    </>
  );
}
