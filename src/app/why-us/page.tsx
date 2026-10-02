import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import WhatsAppButton from "@/components/WhatsAppButton";
import { company, differentiators } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/why-us",
  title: "Why Choose Trio Built Gulf | MEP & Maintenance Contractor Dubai",
  description:
    "Integrated technical expertise, quality workmanship, safety-first delivery and responsive support. Why clients in Dubai choose Trio Built Gulf for MEP, HVAC, fit-out and maintenance.",
});

export default function WhyUsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Why Us", path: "/why-us/" },
            ]),
          ),
        }}
      />

      <section
        aria-labelledby="page-heading"
        className="relative overflow-hidden bg-navy-900 pb-20 pt-20 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-28"
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgba(52,129,113,0.2)_0%,transparent_60%)]"
        />

        <div className="shell relative grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left — heading, sticks while the cards scroll */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <span className="eyebrow text-teal-300">Why us</span>
              <h1
                id="page-heading"
                className="mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[1.02] text-white"
              >
                Why
                <br />
                Trio Built
                <br />
                <span className="text-teal-300">Gulf?</span>
              </h1>
              <p className="mt-7 font-display text-lg font-bold leading-snug text-gold sm:text-xl">
                Built on Expertise.
                <br />
                Driven by Quality.
                <br />
                Focused on Results.
              </p>
              <span aria-hidden="true" className="mt-8 block h-[3px] w-14 bg-gold" />
              <p className="mt-8 max-w-md text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
                At {company.legalName}, we combine technical expertise,
                disciplined execution and customer-focused service to deliver
                reliable solutions across MEP, HVAC, electrical, plumbing,
                fit-out and building maintenance.
              </p>
            </div>
          </div>

          {/* Right — eight numbered cards */}
          <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:col-span-7">
            {differentiators.map((item, i) => (
              <Reveal
                as="li"
                key={item.index}
                delay={(i % 2) * 90}
                className="bg-navy-900"
              >
                <div className="group h-full p-7 transition-colors duration-500 hover:bg-white/[0.04] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-extrabold tabular-nums leading-none text-white/15 transition-colors duration-500 group-hover:text-teal-300">
                      {item.index}
                    </span>
                    <Icon name={item.icon} className="h-7 w-7 text-teal-300" />
                  </div>
                  <span aria-hidden="true" className="mt-7 block h-px w-full bg-teal/40" />
                  <h2 className="mt-7 text-lg font-bold leading-snug text-white">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-white/60">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing statement over a full-width photograph */}
      <section
        aria-labelledby="closing-heading"
        className="relative overflow-hidden bg-navy-950"
      >
        <Image
          src="/images/feat-maintenance.jpg"
          alt="Technician working in protective equipment"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(4,18,31,0.96)_0%,rgba(7,31,54,0.85)_55%,rgba(10,46,80,0.7)_100%)]"
        />

        <div className="shell relative py-24 sm:py-28 lg:py-36">
          <Reveal>
            <span aria-hidden="true" className="block h-[3px] w-14 bg-gold" />
            <h2
              id="closing-heading"
              className="mt-8 max-w-4xl text-balance text-[clamp(1.75rem,4.2vw,3.25rem)] font-extrabold leading-[1.15] text-white"
            >
              &ldquo;Your project deserves more than a service provider. It
              deserves a{" "}
              <span className="text-teal-300">
                technical partner you can rely on.
              </span>
              &rdquo;
            </h2>
            <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.22em] text-white">
              {company.name}
            </p>
            <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Engineering Excellence. Built for Performance.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/contact#enquiry"
                className="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
              >
                Request a Quote
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
              <WhatsAppButton />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
