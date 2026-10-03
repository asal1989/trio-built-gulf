import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import StatCard from "@/components/StatCard";
import TestimonialCard from "@/components/TestimonialCard";
import CTASection from "@/components/CTASection";

import { featured, stats } from "@/lib/site";
import { getPublishedTestimonials } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/",
    title: "Trio Built Gulf | MEP, HVAC & Building Maintenance Services in Dubai",
    description:
      "Trio Built Gulf Technical Services LLC provides professional technical installation, maintenance, MEP, HVAC, interior finishing and building services in Dubai, UAE.",
  });
}

export default async function HomePage() {
  const testimonials = await getPublishedTestimonials();
  return (
    <>
      <Hero />

      {/* ==================================================================
          ABOUT TEASER + HEADLINE FIGURES
          ================================================================== */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="bg-white py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">01 &mdash; Who we are</span>
            <div className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <h2
                id="about-heading"
                className="max-w-3xl text-[clamp(2rem,5.2vw,3.75rem)] font-extrabold uppercase leading-[1.03] text-navy"
              >
                Technical expertise.
                <span className="block text-teal-700">Built around you.</span>
              </h2>
              <Link
                href="/about"
                className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-navy/15 pb-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-navy transition-colors duration-300 hover:border-teal hover:text-teal-700"
              >
                Learn more about us
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-navy/65 sm:text-lg">
              Trio Built Gulf Technical Services LLC provides professional
              technical services, installation and maintenance solutions for
              buildings across Dubai and the United Arab Emirates.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-12 sm:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          FEATURED SERVICE CATEGORIES (editorial)
          ================================================================== */}
      <section
        aria-labelledby="featured-heading"
        className="border-y border-line bg-mist py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <SectionHeader
            id="featured-heading"
            eyebrow="02 — Capability"
            title={
              <>
                Built for every <span className="text-teal-700">detail</span>
              </>
            }
            subtitle="Three disciplines, coordinated end to end — from the systems behind the wall to the finish in front of it."
          />

          <div className="mt-16 space-y-20 lg:space-y-28">
            {featured.map((item, i) => {
              const flipped = i % 2 === 1;
              return (
                <Reveal key={item.title}>
                  <article className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-0">
                    {/* Image */}
                    <div
                      className={`lg:col-span-7 lg:row-start-1 ${
                        flipped ? "lg:order-2 lg:col-start-6" : "lg:col-start-1"
                      }`}
                    >
                      <div className="plate aspect-16/10 lg:aspect-16/11">
                        <Image
                          src={item.image}
                          alt={item.alt}
                          fill
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Overlapping copy card */}
                    <div
                      className={`lg:col-span-6 lg:row-start-1 ${
                        flipped
                          ? "lg:order-1 lg:col-start-1 lg:mr-[-12%]"
                          : "lg:col-start-7 lg:ml-[-12%]"
                      } relative z-10`}
                    >
                      <div className="border border-line bg-white p-8 shadow-[0_40px_80px_-60px_rgba(10,46,80,0.6)] sm:p-10 lg:p-12">
                        <span className="font-display text-xs font-bold tabular-nums tracking-[0.2em] text-teal">
                          {item.index}
                        </span>

                        <h3 className="mt-5 text-[clamp(1.6rem,3.2vw,2.5rem)] font-extrabold uppercase leading-[1.05] text-navy">
                          {item.title}
                        </h3>

                        <span
                          aria-hidden="true"
                          className="mt-6 block h-px w-12 bg-teal transition-all duration-700 [transition-timing-function:var(--ease-brand)] group-hover:w-24"
                        />

                        <p className="mt-6 text-pretty text-base leading-relaxed text-navy/65">
                          {item.summary}
                        </p>

                        <ul className="mt-8 space-y-3">
                          {item.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-3 text-sm font-medium text-navy/75"
                            >
                              <Check
                                className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={120}>
            <div className="mt-16 text-center">
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 transition-colors duration-300 hover:text-navy"
              >
                See all 11 services
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          TESTIMONIALS — renders only once real, approved quotes are added
          to `testimonials` in src/lib/site.ts
          ================================================================== */}
      {testimonials.length > 0 ? (
        <section
          aria-labelledby="testimonials-heading"
          className="border-b border-line bg-white py-24 sm:py-28 lg:py-36"
        >
          <div className="shell">
            <SectionHeader
              id="testimonials-heading"
              eyebrow="03 — Clients"
              title={
                <>
                  What our clients <span className="text-teal-700">say</span>
                </>
              }
            />
            <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Reveal as="li" key={testimonial.name} delay={i * 90}>
                  <TestimonialCard
                    testimonial={{
                      quote: testimonial.quote,
                      author: testimonial.name,
                      role: testimonial.position,
                      company: testimonial.company,
                    }}
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ==================================================================
          CONTACT CTA
          ================================================================== */}
      <CTASection />
    </>
  );
}
