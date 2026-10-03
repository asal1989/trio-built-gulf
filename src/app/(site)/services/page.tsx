import type { Metadata } from "next";
import { SITE_URL, breadcrumbSchema } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import { getContent, getPublishedServices } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";
import { services } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/services/",
    title: "Technical Services Dubai | MEP, HVAC, Ceilings, Plumbing & Electrical",
    description:
      "Eleven licensed technical services in Dubai and the UAE: false ceilings, HVAC and ventilation, plumbing, electrical, painting, tiling, carpentry, glass and aluminium, steel and plaster works.",
  });
}

export default async function ServicesPage() {
  const [copy, servicePages] = await Promise.all([
    getContent<{ eyebrow: string; title: string; accent: string; subtitle: string; guidesHeading: string; guidesIntro: string }>("services"),
    getPublishedServices(),
  ]);
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trio Built Gulf services in Dubai",
    itemListElement: servicePages.map((svc, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: svc.label,
        description: svc.summary,
        provider: { "@id": `${SITE_URL}/#organisation` },
        areaServed: { "@type": "City", name: "Dubai" },
        url: `${SITE_URL}/services/${svc.slug}/`,
      },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services/" }])) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            {copy.title} <span className="text-teal-300">{copy.accent}</span>
          </>
        }
        subtitle={copy.subtitle}
        image="/images/feat-mep.jpg"
        imageAlt="Commercial office interior with exposed ceiling services and ventilation ductwork"
      />

      <section className="relative border-b border-white/10 bg-navy-950 py-20 sm:py-24 lg:py-32">
        <div className="shell">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <span className="eyebrow text-teal-300">
                {services.length} licensed activities
              </span>
            </Reveal>
            <Reveal delay={120}>
              <Link
                href="/contact#enquiry"
                className="group inline-flex items-center gap-2 border-b-2 border-white/20 pb-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                Discuss your requirement
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal as="li" key={service.slug} delay={(i % 3) * 90}>
                <ServiceCard service={service} index={i} />
              </Reveal>
            ))}

            {/* Closing tile — keeps the grid square and adds a conversion route */}
            <Reveal as="li" delay={180}>
              <div className="relative flex h-full min-h-[220px] flex-col justify-center overflow-hidden rounded-xl p-7 sm:p-8">
                <Image
                  src="/images/about-towers.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,18,31,0.96)_38%,rgba(7,31,54,0.72)_100%)]"
                />

                <div className="relative">
                  <p className="flex items-center gap-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                    Something else?
                    <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
                  </p>
                  <h3 className="mt-4 max-w-[15ch] text-2xl font-bold leading-tight text-white">
                    Tell us what your building needs.
                  </h3>
                  <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-white/70">
                    Multiple technical disciplines coordinated under one service
                    partner.
                  </p>
                  <Link
                    href="/contact#enquiry"
                    className="group/cta mt-7 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-navy-950 transition-colors duration-300 hover:bg-white"
                  >
                    Get in touch
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </Reveal>
          </ul>
        </div>
      </section>

      {/* Service guides — one page per search intent, linked from here */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">Technical services in Dubai</span>
            <h2 className="mt-5 max-w-3xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">
              {copy.guidesHeading}
            </h2>
            <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-navy/70 sm:text-lg">
              {copy.guidesIntro}
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicePages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/services/${p.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-line p-6 transition-colors duration-300 hover:border-teal sm:p-7"
                >
                  <h3 className="text-lg font-bold text-navy">
                    {p.h1.lead} {p.h1.accent}
                  </h3>
                  <span aria-hidden="true" className="mt-3 block h-[3px] w-9 bg-gold" />
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy/65">{p.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">
                    Read the guide
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
