import { ArrowUpRight } from "lucide-react";
import Icon from "./Icon";
import type { Service } from "@/lib/site";

/**
 * Service tile. Lifts on hover, draws a teal rule across the top edge and
 * advances the arrow — no colour flooding, no shadow bloom.
 */
export default function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  return (
    <article className="group relative flex h-full flex-col border border-line bg-white p-7 transition-all duration-500 [transition-timing-function:var(--ease-brand)] hover:-translate-y-1.5 hover:border-navy/15 hover:shadow-[0_28px_60px_-38px_rgba(10,46,80,0.55)] sm:p-8">
      {/* Teal accent rule */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-teal transition-transform duration-500 [transition-timing-function:var(--ease-brand)] group-hover:scale-x-100"
      />

      <div className="flex items-start justify-between gap-4">
        <Icon
          name={service.icon}
          className="h-8 w-8 text-navy transition-colors duration-500 group-hover:text-teal"
        />
        <span className="font-display text-xs font-bold tabular-nums tracking-[0.16em] text-navy/25 transition-colors duration-500 group-hover:text-teal">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-8 text-lg font-bold leading-snug text-navy">
        {service.title}
      </h3>

      <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-navy/60">
        {service.description}
      </p>

      <span className="mt-7 flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-navy/40 transition-colors duration-500 group-hover:text-teal-700">
        <span className="h-px w-6 bg-current transition-all duration-500 group-hover:w-10" />
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-brand)] group-hover:translate-x-1 group-hover:-translate-y-1"
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
    </article>
  );
}
