import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getAllProducts, getCheckoutUrl, getProductBySlug } from "@/lib/shop/products";
import { canonicalFor } from "@/lib/seo/meta";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  const canonicalUrl = canonicalFor(`/shop/${product.slug}`).toString();
  const rawDescription = product.seo?.description ?? product.shortDescription ?? "";
  const description = truncateAtBoundary(
    rawDescription || `Explore the ${product.name} remedy from Grounded Living.`,
    155,
  );
  const title = buildMetaTitle(product.seo?.title ?? product.name);
  const imageUrl = new URL(product.image.src, canonicalFor("/")).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      url: canonicalUrl,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: product.image.width,
          height: product.image.height,
          alt: product.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  } satisfies Metadata;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const canonicalUrl = canonicalFor(`/shop/${product.slug}`).toString();
  const checkoutUrl = getCheckoutUrl(product);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription,
    image: [new URL(product.image.src, canonicalFor("/")).toString()],
    url: canonicalUrl,
    brand: {
      "@type": "Brand",
      name: "Grounded Living",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: product.priceCurrency,
      price: (product.priceCents / 100).toFixed(2),
      url: checkoutUrl,
      availability: "https://schema.org/InStock",
    },
  } as const;

  return (
    <Section className="pb-16 pt-12 md:pt-16">
      <Container className="space-y-12">
        <JsonLd item={productJsonLd} id={`product-${product.slug}`} />
        <ProductDetail product={product} checkoutUrl={checkoutUrl} />
        <div className="rounded-3xl border border-ink/10 bg-white/70 p-6 text-sm text-ink/70">
          <h2 className="text-base font-semibold text-ink">Need help choosing?</h2>
          <p className="mt-2">
            Email <a className="underline" href="mailto:hello@groundedliving.org">hello@groundedliving.org</a> for ingredient
            sourcing details, contraindication questions, or wholesale requests.
          </p>
          <p className="mt-3 text-xs text-ink/60">
            These remedies are made in small batches in an Oregon-licensed home kitchen. Statements have not been evaluated by
            the FDA.
          </p>
        </div>
      </Container>
    </Section>
  );
}
