export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductBenefit {
  title: string;
  description: string;
}

export interface ProductUsageStep {
  title: string;
  description: string;
}

export interface ShopProduct {
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  priceCents: number;
  priceCurrency: string;
  netWeight?: string;
  badges: string[];
  benefits: ProductBenefit[];
  ingredients: string[];
  usage: ProductUsageStep[];
  includes: string[];
  shippingNotes: string;
  storageNotes?: string;
  safetyNotes: string[];
  featuredPosts: string[];
  checkoutFallbackUrl: string;
  image: ProductImage;
  seo?: {
    title?: string;
    description?: string;
  };
}
