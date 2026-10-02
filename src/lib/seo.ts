import type { Metadata } from "next";
import { company, services } from "./site";

/** The live domain. Canonical URLs, sitemap, robots and structured data all use it. */
export const SITE_URL = "https://triobuiltgulf.ae";

const OG_IMAGE = {
  url: "/images/hero-dubai.jpg",
  width: 2000,
  height: 1333,
  alt: "Trio Built Gulf Technical Services LLC — Dubai, United Arab Emirates",
};

/**
 * Per-page metadata. `title` is absolute (keyword-led) so the root template
 * does not append the company name a second time.
 */
export function pageMetadata(opts: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      locale: "en_AE",
      url: opts.path,
      siteName: company.legalName,
      title: opts.title,
      description: opts.description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [OG_IMAGE.url],
    },
  };
}

export const breadcrumbSchema = (crumbs: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: `${SITE_URL}${c.path}`,
  })),
});

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: company.legalName,
  alternateName: [company.name, "Trio Built Gulf Dubai"],
  inLanguage: "en-AE",
  publisher: { "@id": `${SITE_URL}/#organisation` },
};

/** The eleven services as a catalogue, so search engines can read each one. */
export const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${company.name} services in Dubai`,
  itemListElement: services.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.title,
      description: s.description,
      provider: { "@id": `${SITE_URL}/#organisation` },
      areaServed: { "@type": "City", name: "Dubai" },
      url: `${SITE_URL}/services/`,
    },
  })),
};
