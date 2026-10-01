import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { differentiators } from "@/lib/site";

export const metadata: Metadata = {
  title: "Why Us",
  description:
    "Why clients choose Trio Built Gulf Technical Services LLC for technical installation and maintenance work in Dubai, UAE.",
  alternates: { canonical: "/why-us" },
};

export default function WhyUsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Why us"
        title={
          <>
            Why clients choose{" "}
            <span className="text-teal-300">Trio Built Gulf</span>
          </>
        }
        image="/images/cta-architecture.jpg"
        imageAlt="Contemporary architecture detail showing structural and facade elements"
      />

      <section className="relative overflow-hidden bg-navy-900 py-20 sm:py-24 lg:py-32">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgba(52,129,113,0.18)_0%,transparent_60%)]"
        />

        <div className="shell relative">
          <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
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
                    <Icon name={item.icon} className="h-7 w-7 text-teal-300" />
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
    </>
  );
}
