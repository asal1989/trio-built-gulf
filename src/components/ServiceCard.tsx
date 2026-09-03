import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/site";

/**
 * Service card: photograph on the left behind a diagonal edge, copy on the
 * right, with the index set large and pale in the top corner.
 *
 * The diagonal is a clip-path on the photo panel rather than a rotated
 * element, so nothing overflows the card and the text column stays a plain
 * rectangle. A gold rule traces the same angle to pick the cut out.
 */
const DIAGONAL = "polygon(0 0, 100% 0, 68% 100%, 0 100%)";

export default function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  return (
    <article className="group relative flex h-full min-h-[220px] overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_-28px_rgba(4,18,31,0.75)] transition-transform duration-500 [transition-timing-function:var(--ease-brand)] hover:-translate-y-1">
      {/* Photo panel */}
      <div
        className="relative w-[38%] shrink-0"
        style={{ clipPath: DIAGONAL }}
      >
        <Image
          src={service.image}
          alt={service.alt}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
          className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-brand)] group-hover:scale-105"
        />
      </div>

      {/* Gold rule tracing the cut */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[38%] bg-gold"
        style={{
          clipPath: `polygon(calc(100% - 3px) 0, 100% 0, 68% 100%, calc(68% - 3px) 100%)`,
        }}
      />

      {/* Copy */}
      <div className="relative flex flex-1 flex-col py-6 pl-3 pr-6 sm:py-7 sm:pr-7">
        <span
          aria-hidden="true"
          className="absolute right-5 top-2 font-display text-5xl font-bold tabular-nums leading-none text-navy/10 sm:text-6xl"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* The right padding keeps a wrapped title clear of the index. */}
        <h3 className="relative pr-14 text-base font-bold leading-snug text-navy sm:pr-16 sm:text-lg">
          {service.title}
        </h3>

        <span aria-hidden="true" className="mt-3 block h-[3px] w-9 bg-gold" />

        <p className="mt-3 flex-1 text-pretty text-[13px] leading-relaxed text-navy/60">
          {service.description}
        </p>

        <Link
          href="/contact#enquiry"
          className="mt-5 inline-flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700 transition-colors duration-300 hover:text-navy"
        >
          Learn more
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span className="sr-only"> about {service.title}</span>
        </Link>
      </div>
    </article>
  );
}
