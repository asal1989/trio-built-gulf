import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TeamCard from "@/components/TeamCard";
import { process, team } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trio Built Gulf Technical Services LLC provides professional technical installation and maintenance solutions for buildings across Dubai and the UAE.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Who we are"
        title={
          <>
            Technical expertise.{" "}
            <span className="text-teal-300">Built around you.</span>
          </>
        }
        image="/images/about-towers.jpg"
        imageAlt="Commercial towers viewed from street level, showing curtain-wall glazing and building services"
      />

      {/* ==================================================================
          WHO WE ARE
          ================================================================== */}
      <section
        aria-labelledby="about-heading"
        className="bg-white py-20 sm:py-24 lg:py-32"
      >
        <div className="shell">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal className="order-2 lg:order-1">
              <div className="relative">
                <div className="plate group aspect-4/5 sm:aspect-square lg:aspect-4/5">
                  <Image
                    src="/images/feat-interior.jpg"
                    alt="Completed interior fit-out with timber detailing and recessed lighting"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>

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

            <div className="order-1 lg:order-2">
              <Reveal>
                <h2
                  id="about-heading"
                  className="text-[clamp(2rem,5.2vw,3.75rem)] font-extrabold uppercase leading-[1.03] text-navy"
                >
                  A single partner across every trade.
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
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          TEAM
          ================================================================== */}
      <section
        id="team"
        aria-labelledby="team-heading"
        className="relative overflow-hidden bg-navy-950 py-20 sm:py-24 lg:py-32"
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
        </div>

        <div className="shell relative">
          <SectionHeader
            id="team-heading"
            eyebrow="Team"
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
          PROCESS
          ================================================================== */}
      <section
        id="process"
        aria-labelledby="process-heading"
        className="border-b border-line bg-mist py-20 sm:py-24 lg:py-32"
      >
        <div className="shell">
          <SectionHeader
            id="process-heading"
            eyebrow="Process"
            title={
              <>
                How we <span className="text-teal-700">work</span>
              </>
            }
            subtitle="A consistent sequence applied to every requirement, from first site visit to ongoing support."
          />

          <ol className="relative mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
            <span
              aria-hidden="true"
              className="absolute left-[19px] top-2 z-0 h-full w-px bg-line lg:left-0 lg:top-[19px] lg:h-px lg:w-full"
            />

            {process.map((step, i) => (
              <Reveal as="li" key={step.index} delay={i * 110} className="relative">
                <div className="flex items-start gap-6 lg:block">
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
    </>
  );
}
