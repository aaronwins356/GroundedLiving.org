export type JsonLdObject = Record<string, unknown>;

interface WebsiteSchemaInput {
  name: string;
  url: string;
  searchUrl?: string;
}

interface OrganizationSchemaInput {
  name: string;
  url: string;
  logoUrl?: string;
}

interface WebPageSchemaInput {
  name: string;
  url: string;
  description?: string;
  breadcrumb?: JsonLdObject;
}

interface BreadcrumbListItem {
  href: string;
  label: string;
}

interface ArticleSchemaInput {
  headline: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
  description: string;
  breadcrumb?: JsonLdObject;
}

export function websiteSchema({ name, url, searchUrl }: WebsiteSchemaInput): JsonLdObject {
  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
  };

  if (searchUrl) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: `${searchUrl}{search_term_string}`,
      "query-input": "required name=search_term_string",
    };
  }

  return schema;
}

export function organizationSchema({ name, url, logoUrl }: OrganizationSchemaInput): JsonLdObject {
  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
  };

  if (logoUrl) {
    schema.logo = {
      "@type": "ImageObject",
      url: logoUrl,
    };
  }

  return schema;
}

export function webPageSchema({ name, url, description, breadcrumb }: WebPageSchemaInput): JsonLdObject {
  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
  };

  if (description) {
    schema.description = description;
  }

  if (breadcrumb) {
    schema.breadcrumb = breadcrumb;
  }

  return schema;
}

export function articleSchema({
  headline,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
  description,
  breadcrumb,
}: ArticleSchemaInput): JsonLdObject {
  const images = Array.isArray(image) ? image : [image];
  const schema: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    datePublished,
    image: images,
    author: {
      "@type": "Person",
      name: authorName,
    },
  };

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (breadcrumb) {
    schema.breadcrumb = breadcrumb;
  }

  return schema;
}

export function breadcrumbList(items: BreadcrumbListItem[]): JsonLdObject | null {
  if (!items || items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  } satisfies JsonLdObject;
}
