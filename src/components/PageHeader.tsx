import Image from "next/image";
import type { ReactNode } from "react";
import { company } from "@/lib/site";

/**
 * The dark navy banner that opens every inner page — the same treatment the
 * contact page introduced, generalised so each top-level route gets a
 * consistent arrival moment instead of starting cold on its first section.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section
      aria-labelledby="page-heading"
      className="relative overflow-hidden bg-navy-950 pb-20 pt-20 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28"
    >
      <Image
        src={image}
        alt={imageAlt}
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
          {eyebrow ?? `${company.city} • ${company.country}`}
        </span>
        <h1
          id="page-heading"
          className="mt-7 max-w-4xl text-[clamp(2.25rem,6.5vw,4.75rem)] font-extrabold uppercase leading-[1.02] text-white"
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
