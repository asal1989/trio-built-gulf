import type { Metadata } from "next";
import { breadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/site";
import { capabilityProjects, getContent, getPublishedProjects, type PublicProject } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/projects/",
    title: "Projects & Capabilities | Fit-Out, MEP & Maintenance Dubai",
    description: "The commercial, interior, facilities, MEP and residential work Trio Built Gulf delivers across Dubai and the UAE.",
  });
}

const STATUS_LABEL = { UPCOMING: "Upcoming", ONGOING: "Ongoing", COMPLETED: "Completed" } as const;

/** Map a CMS project onto the card shape the page already used. */
function toCard(p: PublicProject): Project {
  const year = (p.completionDate ?? p.startDate)?.slice(0, 4);
  return {
    slug: p.slug,
    category: [p.projectType || "Project", STATUS_LABEL[p.status]].join(" · "),
    title: p.name,
    description: p.description || p.scopeOfWork || p.services.join(", "),
    image: p.cover?.url ?? "/images/proj-commercial.jpg",
    alt: p.cover?.alt ?? p.name,
    client: p.client || undefined,
    location: p.location || undefined,
    year,
  };
}

export default async function ProjectsPage() {
  const [copy, published] = await Promise.all([
    getContent<{ eyebrow: string; title: string; accent: string; subtitle: string }>("projects"),
    getPublishedProjects(),
  ]);

  // Real projects published in the admin replace the capability categories.
  const projects: Project[] = published && published.length > 0 ? published.map(toCard) : capabilityProjects;
  const real = Boolean(published && published.length > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects/" }])) }}
      />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            {copy.title} <span className="text-teal-300">{copy.accent}</span>
          </>
        }
        subtitle={real ? "Selected projects delivered by Trio Built Gulf across Dubai and the UAE." : copy.subtitle}
        image="/images/proj-commercial.jpg"
        imageAlt="Contemporary commercial building with a glass and metal panel facade"
      />

      <section className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="shell">
          <Reveal>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-6 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45 sm:text-[11px]">
              {projects.map((project) => (
                <li key={project.slug} className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-teal" />
                  {project.category}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {projects.map((project, i) => {
              const big = i < 2 && projects.length >= 3;
              const span = big ? (i === 0 ? "sm:col-span-2 lg:col-span-8" : "sm:col-span-2 lg:col-span-4") : "lg:col-span-4";
              return (
                <Reveal key={project.slug} delay={(i % 3) * 90} className={span}>
                  <ProjectCard
                    project={project}
                    featured={big}
                    sizes={big ? (i === 0 ? "(min-width: 1024px) 64vw, 100vw" : "(min-width: 1024px) 32vw, 100vw") : undefined}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
