import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { company } from "@/lib/site";
import { SITE_URL, websiteSchema } from "@/lib/seo";

/** LocalBusiness structured data for local search. */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}/#organisation`,
  name: company.legalName,
  alternateName: company.name,
  url: SITE_URL,
  email: company.email,
  telephone: company.phone.label,
  image: `${SITE_URL}/images/hero-dubai.jpg`,
  logo: `${SITE_URL}/images/logo.png`,
  description:
    "Trio Built Gulf Technical Services LLC provides professional technical installation, maintenance, MEP, HVAC, interior finishing and building services in Dubai, UAE.",
  address: {
    "@type": "PostalAddress",
    addressLocality: company.address.locality,
    addressRegion: company.address.region,
    addressCountry: company.address.country,
  },
  areaServed: [
    { "@type": "City", name: "Dubai" },
    { "@type": "Country", name: "United Arab Emirates" },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: company.phone.label,
      contactType: "customer service",
      areaServed: "AE",
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      telephone: company.phoneAlt.label,
      contactType: "sales",
      areaServed: "AE",
      availableLanguage: ["English"],
    },
  ],
  knowsAbout: [
    "False ceiling and light partitions installation",
    "Air-conditioning, ventilation and air filtration",
    "Systems installation and maintenance",
    "Painting contract",
    "Steel products installation and maintenance",
    "Glass and aluminum installation and maintenance",
    "Floor and wall tiling works",
    "Plumbing and sanitary installations",
    "Carpentry and wood flooring works",
    "Electrical fittings and fixtures repairing and maintenance",
    "Plaster works",
  ],
};

/** Header, footer, floating WhatsApp button and site-wide structured data. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-5 focus:py-3 focus:font-display focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.16em] focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <FloatingWhatsApp />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
