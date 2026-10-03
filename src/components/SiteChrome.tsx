import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { SITE_URL, websiteSchema } from "@/lib/seo";
import { getCompany, getPublishedServices, type CompanyInfo } from "@/server/content/public";

/** LocalBusiness structured data for local search, built from the CMS settings. */
function localBusinessSchema(c: CompanyInfo, serviceNames: string[]) {
  const sameAs = Object.values(c.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${SITE_URL}/#organisation`,
    name: c.legalName,
    alternateName: c.name,
    url: SITE_URL,
    email: c.email,
    telephone: c.phone.label,
    image: `${SITE_URL}/images/hero-dubai.jpg`,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Trio Built Gulf Technical Services LLC provides professional technical installation, maintenance, MEP, HVAC, interior finishing and building services in Dubai, UAE.",
    address: {
      "@type": "PostalAddress",
      ...(c.address.street ? { streetAddress: c.address.street } : {}),
      addressLocality: c.address.locality,
      addressRegion: c.address.region,
      addressCountry: c.address.country,
    },
    ...(c.hours ? { openingHours: c.hours } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: [
      { "@type": "City", name: "Dubai" },
      { "@type": "Country", name: "United Arab Emirates" },
    ],
    contactPoint: c.phones.map((p, i) => ({
      "@type": "ContactPoint",
      telephone: p.number,
      contactType: i === 0 ? "customer service" : "sales",
      areaServed: "AE",
      availableLanguage: ["English"],
    })),
    knowsAbout: serviceNames,
  };
}

/** Header, footer, floating WhatsApp button and site-wide structured data. */
export default async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [company, services] = await Promise.all([getCompany(), getPublishedServices()]);
  const serviceMessages = Object.fromEntries(services.map((s) => [s.slug, s.whatsappMessage]));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-5 focus:py-3 focus:font-display focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.16em] focus:text-white"
      >
        Skip to content
      </a>

      <Navbar company={{ city: company.city, country: company.country, location: company.location, email: company.email, phone: company.phone }} />
      <main id="main">{children}</main>
      <Footer />
      <FloatingWhatsApp whatsapp={company.phone.whatsapp} serviceMessages={serviceMessages} />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(company, services.map((s) => s.label))) }}
      />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
