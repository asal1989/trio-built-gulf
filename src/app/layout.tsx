import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { company } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * TODO: set this to the live domain before launch — it makes canonical URLs and
 * social-share images absolute.
 */
const SITE_URL = "https://triobuiltgulf.ae";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trio Built Gulf | Technical Services & Maintenance Dubai",
    template: `%s | ${company.name}`,
  },
  description:
    "Trio Built Gulf Technical Services LLC provides professional technical installation, maintenance, MEP, HVAC, interior finishing and building services in Dubai, UAE.",
  keywords: [
    "technical services Dubai",
    "MEP contractor Dubai",
    "HVAC maintenance UAE",
    "building maintenance Dubai",
    "interior fit-out Dubai",
    "false ceiling installation Dubai",
    "plumbing and electrical maintenance UAE",
  ],
  applicationName: company.legalName,
  authors: [{ name: company.legalName }],
  creator: company.legalName,
  publisher: company.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: SITE_URL,
    siteName: company.legalName,
    title: "Trio Built Gulf | Technical Services & Maintenance Dubai",
    description:
      "Professional technical installation, maintenance, MEP, HVAC and interior finishing services across Dubai and the UAE.",
    images: [
      {
        url: "/images/hero-dubai.jpg",
        width: 1200,
        height: 630,
        alt: "Trio Built Gulf Technical Services LLC — Dubai, United Arab Emirates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trio Built Gulf | Technical Services & Maintenance Dubai",
    description:
      "Professional technical installation, maintenance, MEP, HVAC and interior finishing services across Dubai and the UAE.",
    images: ["/images/hero-dubai.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#071D38",
  width: "device-width",
  initialScale: 1,
};

/** LocalBusiness structured data for local search. */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organisation`,
  name: company.legalName,
  alternateName: company.name,
  url: SITE_URL,
  email: company.email,
  telephone: company.phone.label,
  image: `${SITE_URL}/images/hero-dubai.jpg`,
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AE" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        {/* Without JS the scroll-reveal observer never runs — make sure that
            never leaves content invisible. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-5 focus:py-3 focus:font-display focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.16em] focus:text-white"
        >
          Skip to content
        </a>

        <Navbar />
        <main id="main">{children}</main>
        <Footer />

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </body>
    </html>
  );
}
