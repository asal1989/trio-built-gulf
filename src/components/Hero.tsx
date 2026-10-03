import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { getCompany, getContent } from "@/server/content/public";

type HomeCopy = {
  heroHeadline: string;
  heroAccent: string;
  heroSubtitle: string;
  primaryCta: string;
  whatsappCta: string;
};

/**
 * Full-bleed hero. The photograph is graded toward the brand navy with a
 * layered overlay, and a slow-drifting technical grid sits above it so the
 * frame reads as engineering rather than stock photography. Wording comes from
 * the CMS (Website Content → Home page).
 */
export default async function Hero() {
  const [company, copy] = await Promise.all([getCompany(), getContent<HomeCopy>("home")]);
  const lines = copy.heroHeadline.split("\n").filter(Boolean);

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-[600px] items-end overflow-hidden bg-navy-950 pb-14 pt-20 sm:min-h-[78svh] sm:pb-20 sm:pt-24 lg:min-h-[82svh] lg:pb-24"
    >
      {/* Photograph */}
      <Image
        src="/images/hero-dubai.jpg"
        alt="Dubai skyline at dawn, with commercial towers and infrastructure across the city"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Colour grade + legibility overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(178deg,rgba(4,18,31,0.86)_0%,rgba(7,31,54,0.72)_38%,rgba(10,46,80,0.82)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_85%_at_18%_88%,rgba(52,129,113,0.28)_0%,transparent_58%)]"
      />

      {/* Drifting technical grid */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="tech-grid animate-drift absolute -inset-[20%] text-white/[0.07]" />
      </div>

      {/* Architectural rules + travelling scan line */}
      <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
        <div className="shell relative h-full">
          <div className="absolute inset-y-0 left-[20px] w-px bg-white/10 xl:left-[72px]" />
          <div className="absolute inset-y-0 right-[20px] w-px bg-white/10 xl:right-[72px]" />
          <div className="absolute inset-y-0 left-1/2 w-px overflow-hidden bg-white/[0.06]">
            <div className="animate-scan h-24 w-px bg-gradient-to-b from-transparent via-teal to-transparent" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="shell relative w-full">
        <p className="animate-fade-up eyebrow text-teal-300 [animation-delay:120ms]">
          {company.city} &bull; {company.country}
        </p>

        <p className="animate-fade-up mt-7 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/55 [animation-delay:220ms] sm:text-xs">
          {company.nameLine1}
          <span className="mx-0.5 text-teal-300">/</span>
          {company.nameLine2}
        </p>

        <h1 className="animate-fade-up mt-5 max-w-5xl text-[clamp(2.25rem,6.4vw,5rem)] font-extrabold uppercase leading-[1] text-white [animation-delay:320ms]">
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
          {copy.heroAccent ? <span className="block text-teal-300">{copy.heroAccent}</span> : null}
        </h1>

        <p className="animate-fade-up mt-8 max-w-2xl text-pretty text-base leading-relaxed text-white/70 [animation-delay:440ms] sm:text-lg">
          {copy.heroSubtitle}
        </p>

        <div className="animate-fade-up mt-10 flex flex-col gap-3 [animation-delay:560ms] sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/contact#enquiry"
            className="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-8 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
          >
            {copy.primaryCta}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>

          <WhatsAppButton label={copy.whatsappCta} phone={company.phone.whatsapp} className="px-8" />
        </div>

        {/* Discipline strip along the bottom of the frame */}
        <div className="animate-fade-up mt-14 border-t border-white/15 pt-6 [animation-delay:700ms]">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 sm:text-[11px]">
            {["MEP & HVAC", "Interior Fit-Out", "Installation", "Maintenance"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-teal" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/90 sm:text-[11px]">
            {company.tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
