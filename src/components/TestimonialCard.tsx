import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/site";

/**
 * Client testimonial.
 *
 * No testimonials are published yet — `testimonials` in `src/lib/site.ts` is an
 * empty array by design, and the home page hides the section while it stays
 * empty. Add real, approved quotes there and they render here.
 */
export default function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <figure className="flex h-full flex-col border border-line bg-white p-8 transition-all duration-500 [transition-timing-function:var(--ease-brand)] hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-38px_rgba(10,46,80,0.55)] sm:p-10">
      <Quote
        className="h-8 w-8 shrink-0 text-teal"
        strokeWidth={1.4}
        aria-hidden="true"
      />

      <blockquote className="mt-6 flex-1 text-pretty text-lg leading-relaxed text-navy/80">
        {testimonial.quote}
      </blockquote>

      <figcaption className="mt-8 border-t border-line pt-6">
        <p className="font-display text-sm font-bold text-navy">
          {testimonial.author}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-navy/50">
          {testimonial.role}
          {testimonial.company ? ` — ${testimonial.company}` : ""}
        </p>
      </figcaption>
    </figure>
  );
}
