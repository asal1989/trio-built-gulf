import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "The environments Trio Built Gulf Technical Services LLC works in and the packages it delivers — commercial, interior, facilities, MEP and residential.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title={
          <>
            Our project <span className="text-teal-300">capabilities</span>
          </>
        }
        subtitle="The environments we work in and the packages we deliver. Completed project references are published here as they are approved for release."
        image="/images/proj-commercial.jpg"
        imageAlt="Contemporary commercial building with a glass and metal panel facade"
      />

      <section className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="shell">
          {/* Capability legend */}
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
            <Reveal className="sm:col-span-2 lg:col-span-8">
              <ProjectCard
                project={projects[0]}
                featured
                sizes="(min-width: 1024px) 64vw, 100vw"
              />
            </Reveal>

            <Reveal delay={90} className="sm:col-span-2 lg:col-span-4">
              <ProjectCard
                project={projects[1]}
                featured
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
            </Reveal>

            {projects.slice(2).map((project, i) => (
              <Reveal key={project.slug} delay={i * 90} className="lg:col-span-4">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
