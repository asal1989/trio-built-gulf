import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "The eleven licensed technical activities Trio Built Gulf Technical Services LLC carries out in Dubai and the UAE — MEP, HVAC, interior finishing, maintenance and more.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title={
          <>
            Our core <span className="text-teal-300">services</span>
          </>
        }
        subtitle="Eleven licensed technical activities, delivered as a single coordinated scope or as a standalone trade."
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
    </>
  );
}
