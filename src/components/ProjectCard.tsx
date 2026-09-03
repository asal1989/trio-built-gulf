import Image from "next/image";
import type { Project } from "@/lib/site";

/**
 * Project / capability tile.
 *
 * Renders `client`, `location` and `year` only when those fields are supplied,
 * so the same card serves both the current capability categories and real
 * project records once they are added to `src/lib/site.ts`.
 */
export default function ProjectCard({
  project,
  featured = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  project: Project;
  featured?: boolean;
  sizes?: string;
}) {
  const meta = [project.client, project.location, project.year].filter(Boolean);

  return (
    <article
      className={`group relative flex overflow-hidden bg-navy-900 ${
        featured ? "min-h-[420px] lg:min-h-[560px]" : "min-h-[340px] lg:min-h-[400px]"
      }`}
    >
      <div className="plate absolute inset-0">
        <Image
          src={project.image}
          alt={project.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>

      {/* Legibility gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,18,31,0.92)_0%,rgba(7,29,56,0.45)_45%,rgba(7,29,56,0.08)_100%)]"
      />

      <div className="relative z-10 mt-auto w-full p-7 sm:p-8">
        <span className="inline-flex items-center gap-2 border border-white/25 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
          {project.category}
        </span>

        <h3
          className={`mt-5 font-bold leading-tight text-white ${
            featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          {project.title}
        </h3>

        {/* Teal rule that opens on hover */}
        <span
          aria-hidden="true"
          className="mt-4 block h-px w-10 bg-teal transition-all duration-500 [transition-timing-function:var(--ease-brand)] group-hover:w-20"
        />

        <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/65">
          {project.description}
        </p>

        {meta.length > 0 ? (
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
            {project.client ? (
              <div className="flex gap-2">
                <dt className="sr-only">Client</dt>
                <dd>{project.client}</dd>
              </div>
            ) : null}
            {project.location ? (
              <div className="flex gap-2">
                <dt className="sr-only">Location</dt>
                <dd>{project.location}</dd>
              </div>
            ) : null}
            {project.year ? (
              <div className="flex gap-2">
                <dt className="sr-only">Year</dt>
                <dd>{project.year}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </article>
  );
}
