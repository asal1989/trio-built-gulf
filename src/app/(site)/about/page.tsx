import type { Metadata } from "next";
import { breadcrumbSchema } from "@/lib/seo";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TeamCard from "@/components/TeamCard";
import Icon from "@/components/Icon";
import { process, team } from "@/lib/site";
import { getContent } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";

type Intro = { headline: string; paragraphs: string[]; badge: string };
type Values = { heading: string; items: { title: string; description: string; icon: string }[] };
type Commitments = { heading: string; intro: string; points: string[] };

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/about/",
    title: "About Trio Built Gulf | Technical Services Company in Dubai, UAE",
    description:
      "Trio Built Gulf Technical Services LLC is a Dubai technical services company delivering installation, MEP, HVAC and building maintenance for commercial, residential and industrial properties across the UAE.",
  });
}

export default async function AboutPage() {
  const [page, intro, vision, mission, values, safety, quality] = await Promise.all([
    getContent<{ eyebrow: string; title: string; accent: string }>("about"),
    getContent<Intro>("intro"),
    getContent<{ text: string }>("vision"),
    getContent<{ text: string }>("mission"),
    getContent<Values>("values"),
    getContent<Commitments>("health-safety"),
    getContent<Commitments>("quality"),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about/" }])) }}
      />
      <PageHeader
        eyebrow={page.eyebrow}
        title={
          <>
            {page.title} <span className="text-teal-300">{page.accent}</span>
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
                    {intro.badge}
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
                  {intro.headline}
                </h2>
              </Reveal>

              <Reveal delay={100}>
                <div className="mt-8 space-y-5 text-pretty text-base leading-relaxed text-navy/65 sm:text-lg">
                  {intro.paragraphs.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          VISION, MISSION, VALUES  (editable in Website Content)
          ================================================================== */}
      <section aria-labelledby="values-heading" className="border-t border-line bg-mist py-20 sm:py-24 lg:py-28">
        <div className="shell">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full bg-navy-950 p-8 text-white sm:p-10">
                <span className="eyebrow text-gold">Our vision</span>
                <p className="mt-5 text-pretty text-xl font-semibold leading-snug sm:text-2xl">&ldquo;{vision.text}&rdquo;</p>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="h-full border border-gold bg-white p-8 sm:p-10">
                <span className="eyebrow text-teal-700">Our mission</span>
                <p className="mt-5 text-pretty text-xl font-semibold leading-snug text-navy sm:text-2xl">&ldquo;{mission.text}&rdquo;</p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <h2 id="values-heading" className="mt-16 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold uppercase leading-tight text-navy">
              {values.heading}
            </h2>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.items.map((v, i) => (
              <Reveal as="li" key={v.title} delay={(i % 4) * 70}>
                <div className="h-full rounded-xl border border-line bg-white p-6">
                  <Icon name={v.icon} className="h-7 w-7 text-teal" />
                  <h3 className="mt-4 text-base font-bold text-navy">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================================================================
          HEALTH, SAFETY & QUALITY  (editable in Website Content)
          ================================================================== */}
      <section aria-label="Health, safety and quality" className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-16">
          {[safety, quality].map((block) => (
            <Reveal key={block.heading}>
              <h2 className="text-[clamp(1.5rem,3.4vw,2.25rem)] font-extrabold uppercase leading-tight text-navy">{block.heading}</h2>
              <span aria-hidden="true" className="mt-4 block h-[3px] w-12 bg-gold" />
              <p className="mt-5 text-pretty text-base leading-relaxed text-navy/70">{block.intro}</p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {block.points.map((pt) => (
                  <li key={pt} className="py-3.5 text-base text-navy">
                    {pt}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
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
