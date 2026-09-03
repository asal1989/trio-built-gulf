import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import ServiceCard from "@/components/ServiceCard";
import ProjectCard from "@/components/ProjectCard";
import StatCard from "@/components/StatCard";
import TeamCard from "@/components/TeamCard";
import TestimonialCard from "@/components/TestimonialCard";
import CTASection from "@/components/CTASection";

import {
  differentiators,
  featured,
  process,
  projects,
  services,
  stats,
  team,
  testimonials,
} from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ==================================================================
          02 — TRUST / INTRODUCTION
          ================================================================== */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="bg-white py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <Reveal className="order-2 lg:order-1">
              <div className="relative">
                <div className="plate group aspect-4/5 sm:aspect-square lg:aspect-4/5">
                  <Image
                    src="/images/about-towers.jpg"
                    alt="Commercial towers viewed from street level, showing curtain-wall glazing and building services"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>

                {/* Overlapping technical caption plate */}
                <div className="absolute -bottom-6 -right-2 hidden max-w-[230px] border-l-2 border-teal bg-navy-950 p-6 sm:block lg:-right-8">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                    Dubai &bull; UAE
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Technical services delivered across commercial, residential
                    and industrial environments.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <Reveal>
                <span className="eyebrow text-teal-700">01 &mdash; Who we are</span>
                <h2
                  id="about-heading"
                  className="mt-7 text-[clamp(2rem,5.2vw,3.75rem)] font-extrabold uppercase leading-[1.03] text-navy"
                >
                  Technical expertise.
                  <span className="block text-teal-700">Built around you.</span>
                </h2>
              </Reveal>

              <Reveal delay={100}>
                <div className="mt-8 space-y-5 text-pretty text-base leading-relaxed text-navy/65 sm:text-lg">
                  <p>
                    Trio Built Gulf Technical Services LLC provides professional
                    technical services, installation and maintenance solutions
                    for buildings across Dubai and the United Arab Emirates.
                  </p>
                  <p>
                    Our work spans mechanical, electrical and plumbing
                    disciplines alongside interior finishing trades &mdash;
                    delivered with a consistent focus on quality of workmanship,
                    reliability on site and timely execution.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <StatCard key={stat.label} stat={stat} />
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          03 — CORE SERVICES
          ================================================================== */}
      <section
        id="services"
        aria-labelledby="services-heading"
        className="border-y border-line bg-mist py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <SectionHeader
            id="services-heading"
            eyebrow="02 — What we do"
            title={
              <>
                Our core <span className="text-teal-700">services</span>
              </>
            }
            subtitle="Complete technical solutions for modern buildings."
            action={
              <Link
                href="/contact#enquiry"
                className="group inline-flex items-center gap-2 border-b-2 border-navy/15 pb-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-navy transition-colors duration-300 hover:border-teal hover:text-teal-700"
              >
                Discuss your requirement
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            }
          />

          <ul className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal
                as="li"
                key={service.slug}
                delay={(i % 3) * 90}
                className="bg-white"
              >
                <ServiceCard service={service} index={i} />
              </Reveal>
            ))}

            {/* Closing tile — keeps the grid square and adds a conversion route */}
            <Reveal as="li" delay={180} className="bg-navy">
              <div className="flex h-full flex-col justify-between p-7 sm:p-8">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                  Something else?
                </p>
                <div className="mt-10">
                  <h3 className="text-lg font-bold leading-snug text-white">
                    Tell us what your building needs.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    Multiple technical disciplines coordinated under one service
                    partner.
                  </p>
                  <Link
                    href="/contact#enquiry"
                    className="group mt-7 inline-flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:text-teal-300"
                  >
                    <span className="h-px w-6 bg-teal transition-all duration-500 group-hover:w-10" />
                    Get in touch
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </Reveal>
          </ul>
        </div>
      </section>

      {/* ==================================================================
          04 — FEATURED SERVICE CATEGORIES (editorial)
          ================================================================== */}
      <section
        aria-labelledby="featured-heading"
        className="bg-white py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <SectionHeader
            id="featured-heading"
            eyebrow="03 — Capability"
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
        </div>
      </section>

      {/* ==================================================================
          05 — WHY TRIO BUILT GULF
          ================================================================== */}
      <section
        id="why-us"
        aria-labelledby="why-heading"
        className="relative overflow-hidden bg-navy-900 py-24 sm:py-28 lg:py-36"
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgba(52,129,113,0.18)_0%,transparent_60%)]"
        />

        <div className="shell relative">
          <SectionHeader
            id="why-heading"
            eyebrow="04 — Why us"
            tone="dark"
            title={
              <>
                Why clients choose{" "}
                <span className="text-teal-300">Trio Built Gulf</span>
              </>
            }
          />

          <ul className="mt-16 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item, i) => (
              <Reveal
                as="li"
                key={item.index}
                delay={i * 90}
                className="bg-navy-900"
              >
                <div className="group h-full p-8 transition-colors duration-500 hover:bg-white/[0.04] lg:p-9">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-extrabold tabular-nums leading-none text-white/15 transition-colors duration-500 group-hover:text-teal-300">
                      {item.index}
                    </span>
                    <Icon
                      name={item.icon}
                      className="h-7 w-7 text-teal-300"
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className="mt-8 block h-px w-full bg-teal/40"
                  />

                  <h3 className="mt-8 text-xl font-bold uppercase leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-pretty text-sm leading-relaxed text-white/60">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================================================================
          06 — PROJECT CAPABILITIES
          ================================================================== */}
      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="bg-white py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <SectionHeader
            id="projects-heading"
            eyebrow="05 — Capabilities"
            title={
              <>
                Our project <span className="text-teal-700">capabilities</span>
              </>
            }
            subtitle="The environments we work in and the packages we deliver. Completed project references are published here as they are approved for release."
          />

          {/* Capability legend */}
          <Reveal delay={100}>
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45 sm:text-[11px]">
              {projects.map((project) => (
                <li key={project.slug} className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-teal" />
                  {project.category}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <Reveal className="sm:col-span-2 lg:col-span-8">
              <ProjectCard
                project={projects[0]}
                featured
                sizes="(min-width: 1024px) 64vw, 100vw"
              />
            </Reveal>

            <Reveal delay={90} className="sm:col-span-2 lg:col-span-4">
              <ProjectCard
                project={projects[1]}
                featured
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
            </Reveal>

            {projects.slice(2).map((project, i) => (
              <Reveal key={project.slug} delay={i * 90} className="lg:col-span-4">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          07 — PROCESS
          ================================================================== */}
      <section
        id="process"
        aria-labelledby="process-heading"
        className="border-y border-line bg-mist py-24 sm:py-28 lg:py-36"
      >
        <div className="shell">
          <SectionHeader
            id="process-heading"
            eyebrow="06 — Process"
            title={
              <>
                How we <span className="text-teal-700">work</span>
              </>
            }
            subtitle="A consistent sequence applied to every requirement, from first site visit to ongoing support."
          />

          <ol className="relative mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
            {/* Connecting rule — horizontal on desktop, vertical on mobile */}
            <span
              aria-hidden="true"
              className="absolute left-[19px] top-2 z-0 h-full w-px bg-line lg:left-0 lg:top-[19px] lg:h-px lg:w-full"
            />

            {process.map((step, i) => (
              <Reveal as="li" key={step.index} delay={i * 110} className="relative">
                <div className="flex items-start gap-6 lg:block">
                  {/* Node */}
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal bg-white font-display text-[11px] font-extrabold tabular-nums text-teal-700">
                    {step.index}
                  </span>

                  <div className="lg:mt-8">
                    <h3 className="text-lg font-bold uppercase tracking-tight text-navy lg:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-navy/60">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================================================================
          08 — TEAM
          ================================================================== */}
      <section
        id="team"
        aria-labelledby="team-heading"
        className="relative overflow-hidden bg-navy-950 py-24 sm:py-28 lg:py-36"
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
        </div>

        <div className="shell relative">
          <SectionHeader
            id="team-heading"
            eyebrow="07 — Team"
            tone="dark"
            title={
              <>
                The people <span className="text-teal-300">behind the work</span>
              </>
            }
            subtitle="Speak directly with the people responsible for delivery."
          />

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:max-w-4xl">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 110}>
                <TeamCard member={member} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          TESTIMONIALS — renders only once real, approved quotes are added
          to `testimonials` in src/lib/site.ts
          ================================================================== */}
      {testimonials.length > 0 ? (
        <section
          aria-labelledby="testimonials-heading"
          className="border-b border-line bg-mist py-24 sm:py-28 lg:py-36"
        >
          <div className="shell">
            <SectionHeader
              id="testimonials-heading"
            eyebrow="08 — Clients"
              title={
                <>
                  What our clients <span className="text-teal-700">say</span>
                </>
              }
            />
            <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Reveal as="li" key={testimonial.author} delay={i * 90}>
                  <TestimonialCard testimonial={testimonial} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ==================================================================
          09 — CONTACT CTA
          ================================================================== */}
      <CTASection />
    </>
  );
}
