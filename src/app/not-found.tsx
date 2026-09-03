import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-navy-950 py-32">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
      </div>

      <div className="shell relative">
        <span className="eyebrow text-teal-300">Error 404</span>
        <h1 className="mt-7 max-w-3xl text-[clamp(2.25rem,6.5vw,4.5rem)] font-extrabold uppercase leading-[1.02] text-white">
          This page could not be found.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/65">
          The page you are looking for may have moved. Head back to the homepage
          or get in touch with our team directly.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
          >
            Back to Home
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-teal-300 hover:bg-white/5"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
