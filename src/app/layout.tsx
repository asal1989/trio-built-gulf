import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { company } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trio Built Gulf | MEP, HVAC & Building Maintenance Services in Dubai",
    template: `%s | ${company.name}`,
  },
  description:
    "Trio Built Gulf Technical Services LLC provides professional technical installation, maintenance, MEP, HVAC, interior finishing and building services in Dubai, UAE.",
  keywords: [
    "Trio Built Gulf",
    "technical services Dubai",
    "MEP contractor Dubai",
    "HVAC maintenance Dubai",
    "AC maintenance Dubai",
    "building maintenance Dubai",
    "interior fit-out Dubai",
    "false ceiling installation Dubai",
    "plumbing and electrical maintenance Dubai",
    "facilities maintenance UAE",
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
    title: "Trio Built Gulf | MEP, HVAC & Building Maintenance Services in Dubai",
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
    title: "Trio Built Gulf | MEP, HVAC & Building Maintenance Services in Dubai",
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
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: "#071D38",
  width: "device-width",
  initialScale: 1,
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
        {children}
      </body>
    </html>
  );
}
