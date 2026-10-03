"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ProjectStatus } from "@/generated/prisma/enums";
import { audit } from "@/server/audit";
import { guarded, fieldErrorsFrom, slugify, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";

const publicRefresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/projects/", "page");
};

const text = (max: number) => z.string().trim().max(max);
const dateOrUndefined = (v: string) => (v ? new Date(`${v}T00:00:00Z`) : undefined);

const ProjectSchema = z.object({
  name: text(160).min(2, "Enter the project name."),
  slug: text(80).optional(),
  client: text(160).optional(),
  location: text(160).optional(),
  projectType: text(80).optional(),
  status: z.nativeEnum(ProjectStatus),
  startDate: text(10).optional(),
  completionDate: text(10).optional(),
  description: text(6000).optional(),
  scopeOfWork: text(6000).optional(),
  coverId: text(60).optional(),
  gallery: z.array(z.string().max(60)).max(60).default([]),
  services: z.array(z.string().max(60)).max(30).default([]),
  featured: z.boolean(),
  published: z.boolean(),
  order: z.coerce.number().int().min(0).max(100000).default(0),
});

export async function saveProject(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("project:manage", async (user) => {
    const id = str(fd, "id");
    const opt = (k: string) => str(fd, k) || undefined;
    const parsed = ProjectSchema.safeParse({
      name: str(fd, "name"),
      slug: opt("slug"),
      client: opt("client"),
      location: opt("location"),
      projectType: opt("projectType"),
      status: str(fd, "status") || "ONGOING",
      startDate: opt("startDate"),
      completionDate: opt("completionDate"),
      description: opt("description"),
      scopeOfWork: opt("scopeOfWork"),
      coverId: opt("coverId"),
      gallery: fd.getAll("gallery").map(String).filter(Boolean),
      services: fd.getAll("services").map(String).filter(Boolean),
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
      order: str(fd, "order") || "0",
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;

    if (d.startDate && d.completionDate && d.completionDate < d.startDate) return { error: "Completion date cannot be before the start date." };

    const slug = slugify(d.slug || d.name);
    if (!slug) return { error: "Enter a URL slug." };
    const clash = await db.project.findFirst({ where: { slug, NOT: id ? { id } : undefined }, select: { id: true } });
    if (clash) return { error: `The slug "${slug}" is already used by another project.` };

    const data = {
      slug,
      name: d.name,
      client: d.client ?? null,
      location: d.location ?? null,
      projectType: d.projectType ?? null,
      status: d.status,
      startDate: dateOrUndefined(d.startDate ?? "") ?? null,
      completionDate: dateOrUndefined(d.completionDate ?? "") ?? null,
      description: d.description ?? null,
      scopeOfWork: d.scopeOfWork ?? null,
      coverId: d.coverId || null,
      featured: d.featured,
      published: d.published,
      order: d.order,
    };
    const serviceRefs = d.services.map((sid) => ({ id: sid }));

    let savedId = id;
    await db.$transaction(async (tx) => {
      if (id) {
        await tx.project.update({ where: { id }, data: { ...data, services: { set: serviceRefs } } });
        await tx.projectImage.deleteMany({ where: { projectId: id } });
      } else {
        savedId = (await tx.project.create({ data: { ...data, services: { connect: serviceRefs } } })).id;
      }
      if (d.gallery.length) await tx.projectImage.createMany({ data: d.gallery.map((mediaId, order) => ({ projectId: savedId, mediaId, order })), skipDuplicates: true });
    });

    await audit({ userId: user.id, action: id ? "UPDATE" : "CREATE", entity: "Project", entityId: savedId, summary: `${id ? "Updated" : "Created"} project “${d.name}”${d.published ? "" : " (draft)"}` });
    publicRefresh();
    return { ok: id ? "Project saved." : "Project created.", id: savedId };
  });
}

export async function toggleProjectPublished(fd: FormData): Promise<void> {
  const res = await guarded("project:manage", async (user) => {
    const id = str(fd, "id");
    const p = await db.project.findUnique({ where: { id } });
    if (!p) return;
    await db.project.update({ where: { id }, data: { published: !p.published } });
    await audit({ userId: user.id, action: "UPDATE", entity: "Project", entityId: id, summary: `${p.published ? "Unpublished" : "Published"} project “${p.name}”` });
  });
  if (res.error) throw new Error(res.error);
  publicRefresh();
}

export async function deleteProject(fd: FormData): Promise<void> {
  const res = await guarded("project:manage", async (user) => {
    const id = str(fd, "id");
    const p = await db.project.findUnique({ where: { id } });
    if (!p) return;
    await db.project.delete({ where: { id } });
    await audit({ userId: user.id, action: "DELETE", entity: "Project", entityId: id, summary: `Deleted project “${p.name}”` });
  });
  if (res.error) throw new Error(res.error);
  publicRefresh();
  redirect("/admin/projects/");
}
