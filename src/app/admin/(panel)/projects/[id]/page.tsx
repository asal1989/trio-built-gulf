import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { ConfirmForm } from "@/components/admin/forms";
import { PageHeading } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";
import { deleteProject } from "../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("project:manage");
  const { id } = await params;
  const p = await db.project.findUnique({
    where: { id },
    include: { cover: true, services: { select: { id: true } }, gallery: { orderBy: { order: "asc" }, include: { media: true } } },
  });
  if (!p) notFound();
  const services = await db.service.findMany({ select: { id: true, label: true }, orderBy: { order: "asc" } });
  const picked = (m: { id: string; storageKey: string; alt: string | null; fileName: string }) => ({
    id: m.id,
    url: mediaUrl(m.storageKey),
    alt: m.alt ?? "",
    name: m.fileName,
  });
  const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

  return (
    <>
      <Link href="/admin/projects/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All projects
      </Link>
      <PageHeading
        title={p.name}
        actions={
          <ConfirmForm
            action={deleteProject}
            hidden={{ id: p.id }}
            title={`Delete “${p.name}”?`}
            message="The project is removed from the website. Its images stay in the media library."
            confirmLabel="Delete project"
          >
            Delete
          </ConfirmForm>
        }
      />
      <ProjectForm
        services={services}
        initial={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          client: p.client ?? "",
          location: p.location ?? "",
          projectType: p.projectType ?? "",
          status: p.status,
          startDate: day(p.startDate),
          completionDate: day(p.completionDate),
          description: p.description ?? "",
          scopeOfWork: p.scopeOfWork ?? "",
          cover: p.cover ? picked(p.cover) : null,
          gallery: p.gallery.map((g) => picked(g.media)),
          services: p.services.map((s) => s.id),
          featured: p.featured,
          published: p.published,
          order: p.order,
        }}
      />
    </>
  );
}
