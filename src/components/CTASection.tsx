import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import ParallaxLayer from "./ParallaxLayer";
import Reveal from "./Reveal";
import { WhatsAppGlyph } from "./WhatsAppButton";
import { company, defaultWhatsAppMessage, whatsappLink } from "@/lib/site";

export default function CTASection() {
  return (
    <section
      id="contact-cta"
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-navy-950"
    >
      {/* Architectural backdrop, pushed far back */}
      <ParallaxLayer mode="element" speed={0.14} className="absolute -inset-y-16 inset-x-0">
        <Image
          src="/images/cta-architecture.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.18]"
        />
      </ParallaxLayer>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,18,31,0.96)_0%,rgba(7,31,54,0.88)_55%,rgba(10,46,80,0.9)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_10%,rgba(52,129,113,0.22)_0%,transparent_60%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
      </div>

      <div className="shell relative py-24 sm:py-28 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="eyebrow text-teal-300">Talk to us on WhatsApp</span>
              <h2
                id="cta-heading"
                className="mt-7 text-[clamp(2.25rem,6.2vw,4.5rem)] font-extrabold uppercase leading-[1.02] text-white"
              >
                Need a technical
                <br />
                <span className="text-teal-300">service?</span>
              </h2>
              <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
                Installation, repair or maintenance in Dubai &mdash; message our
                Dubai team directly on WhatsApp and tell us what you need.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href={whatsappLink(company.phone.whatsapp, defaultWhatsAppMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-full items-center justify-center gap-4 rounded-[12px] bg-[#1f9d55] px-8 py-5 text-white shadow-[0_18px_40px_-16px_rgba(31,157,85,0.7)] transition-colors duration-300 hover:bg-[#177f44] sm:w-auto"
                >
                  <WhatsAppGlyph className="h-9 w-9 shrink-0" />
                  <span className="flex flex-col text-left leading-tight">
                    <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      Talk to our Dubai team
                    </span>
                    <span className="font-display text-base font-bold uppercase tracking-[0.12em]">
                      WhatsApp now &rarr;
                    </span>
                  </span>
                  <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                </a>
                <Link
                  href="/contact#enquiry"
                  className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-teal-300 hover:bg-white/5"
                >
                  Request a Quote
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.5}
                  />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gold px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-navy-950 transition-colors duration-300 hover:bg-gold-600"
                >
                  Contact Us
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Contact rail */}
          <Reveal delay={200} className="lg:col-span-5">
            <div className="border-t border-white/15 lg:border-l lg:border-t-0 lg:pl-12">
              <dl className="divide-y divide-white/10">
                <div className="flex gap-5 py-6">
                  <MapPin
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-300"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Location
                    </dt>
                    <dd className="mt-2 text-base text-white">
                      {company.location}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-5 py-6">
                  <Mail
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-300"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Email
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${company.email}`}
                        className="break-all text-base text-white transition-colors hover:text-teal-300"
                      >
                        {company.email}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-5 py-6">
                  <Phone
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-300"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Telephone
                    </dt>
                    <dd className="mt-2 space-y-1">
                      <a
                        href={company.phone.href}
                        className="block text-base text-white transition-colors hover:text-teal-300"
                      >
                        {company.phone.label}
                        <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
                          Co-Founder
                        </span>
                      </a>
                      <a
                        href={company.phoneAlt.href}
                        className="block text-base text-white/70 transition-colors hover:text-teal-300"
                      >
                        {company.phoneAlt.label}
                        <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
                          Co-Founder
                        </span>
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
