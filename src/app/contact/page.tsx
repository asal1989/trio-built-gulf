import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import ContactForm from "@/components/ContactForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import Reveal from "@/components/Reveal";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Trio Built Gulf Technical Services LLC in Dubai, UAE for technical installation, MEP, HVAC, interior finishing and building maintenance enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <section
        aria-labelledby="contact-heading"
        className="relative overflow-hidden bg-navy-950 pb-20 pt-20 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28"
      >
        <Image
          src="/images/contact-plans.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(140deg,rgba(4,18,31,0.95)_0%,rgba(7,31,54,0.88)_60%,rgba(10,46,80,0.9)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(85%_65%_at_85%_15%,rgba(52,129,113,0.22)_0%,transparent_60%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
        </div>

        <div className="shell relative">
          <span className="eyebrow text-teal-300">
            {company.city} &bull; {company.country}
          </span>
          <h1
            id="contact-heading"
            className="mt-7 max-w-4xl text-[clamp(2.25rem,6.5vw,4.75rem)] font-extrabold uppercase leading-[1.02] text-white"
          >
            Contact <span className="text-teal-300">Trio Built Gulf</span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
            Tell us about your technical service, installation or maintenance
            requirement and our team will come back to you.
          </p>
        </div>
      </section>

      {/* Details + form */}
      <section className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Left — contact details */}
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="text-[clamp(1.6rem,3.4vw,2.5rem)] font-extrabold uppercase leading-[1.05] text-navy">
                  Talk to our <span className="text-teal-700">team</span>
                </h2>

                <dl className="mt-10 divide-y divide-line border-y border-line">
                  <div className="flex gap-5 py-7">
                    <MapPin
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45">
                        Location
                      </dt>
                      <dd className="mt-2 text-base text-navy">
                        {company.location}
                      </dd>
                    </div>
                  </div>

                  <div className="flex gap-5 py-7">
                    <Phone
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45">
                        Telephone
                      </dt>
                      <dd className="mt-2 space-y-2">
                        <a
                          href={company.phone.href}
                          className="block text-base text-navy transition-colors hover:text-teal-700"
                        >
                          {company.phone.label}
                        </a>
                        <a
                          href={company.phoneAlt.href}
                          className="block text-base text-navy transition-colors hover:text-teal-700"
                        >
                          {company.phoneAlt.label}
                          <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-navy/45">
                            Co-Founder
                          </span>
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex gap-5 py-7">
                    <Mail
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45">
                        Email
                      </dt>
                      <dd className="mt-2">
                        <a
                          href={`mailto:${company.email}`}
                          className="break-all text-base text-navy transition-colors hover:text-teal-700"
                        >
                          {company.email}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex gap-5 py-7">
                    <Clock
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45">
                        Service Support
                      </dt>
                      <dd className="mt-2 text-base text-navy">
                        24/7 service support
                      </dd>
                    </div>
                  </div>
                </dl>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-10 border-l-2 border-teal bg-mist p-7 sm:p-8">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                    Prefer to message?
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-navy/65">
                    Send us the details on WhatsApp and we will respond from the
                    same number.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <WhatsAppButton />
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right — reassurance panel */}
            <div className="lg:col-span-7">
              <Reveal delay={80}>
                <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl">
                  <Image
                    src="/images/contact-plans.jpg"
                    alt="Technical drawings and plans on a desk"
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(150deg,rgba(4,18,31,0.88)_0%,rgba(7,31,54,0.7)_100%)]"
                  />
                  <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
                    <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                      Dubai &bull; United Arab Emirates
                    </p>
                    <h3 className="mt-4 max-w-[18ch] text-2xl font-bold leading-tight text-white sm:text-3xl">
                      Tell us the site, the scope and the timing.
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                      We will come back with the right discipline and a clear
                      next step, whether the work is a single trade or a
                      coordinated fit-out.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section
        id="enquiry"
        aria-labelledby="enquiry-heading"
        className="scroll-mt-28 bg-mist py-20 sm:py-24 lg:py-28"
      >
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">Enquiry</span>
            <h2
              id="enquiry-heading"
              className="mt-6 text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.05] text-navy"
            >
              Send an <span className="text-teal-700">Enquiry</span>
            </h2>
            <span
              aria-hidden="true"
              className="mt-5 block h-1 w-16 rounded-full bg-gold"
            />
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-navy/65">
              Have a question or need a custom solution? Fill out the form and
              our team will get back to you shortly.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-12">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
