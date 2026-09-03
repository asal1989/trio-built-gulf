import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Reveal from "./Reveal";
import WhatsAppButton from "./WhatsAppButton";
import { company } from "@/lib/site";

export default function CTASection() {
  return (
    <section
      id="contact-cta"
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-navy-950"
    >
      {/* Architectural backdrop, pushed far back */}
      <Image
        src="/images/cta-architecture.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center opacity-[0.18]"
      />
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
              <span className="eyebrow text-teal-300">Start a conversation</span>
              <h2
                id="cta-heading"
                className="mt-7 text-[clamp(2.25rem,6.2vw,4.5rem)] font-extrabold uppercase leading-[1.02] text-white"
              >
                Let&rsquo;s build
                <br />
                something <span className="text-teal-300">better.</span>
              </h2>
              <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
                Have a technical service, installation or maintenance
                requirement? Talk to our team.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/contact#enquiry"
                  className="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
                >
                  Request a Quote
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.5}
                  />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-teal-300 hover:bg-white/5"
                >
                  Contact Us
                </Link>

                <WhatsAppButton />
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
