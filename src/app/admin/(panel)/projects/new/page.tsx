import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";
import { PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

export default async function NewProjectPage() {
  await requirePage("project:manage");
  const services = await db.service.findMany({ select: { id: true, label: true }, orderBy: { order: "asc" } });
  return (
    <>
      <Link href="/admin/projects/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All projects
      </Link>
      <PageHeading title="New project" />
      <ProjectForm
        services={services}
        initial={{
          name: "",
          slug: "",
          client: "",
          location: "",
          projectType: "",
          status: "ONGOING",
          startDate: "",
          completionDate: "",
          description: "",
          scopeOfWork: "",
          cover: null,
          gallery: [],
          services: [],
          featured: false,
          published: false,
          order: 100,
        }}
      />
    </>
  );
}
