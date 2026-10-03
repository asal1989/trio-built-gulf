"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { MediaCategory } from "@/generated/prisma/enums";
import { audit } from "@/server/audit";
import { guarded, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";
import { deleteMediaFile, mediaUsage, saveMediaFile } from "@/server/media/store";

const refresh = () => {
  revalidatePath("/admin/media/", "page");
  revalidateTag("content", "max");
};

export async function uploadMedia(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("media:manage", async (user) => {
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return { error: "Choose at least one file." };
    if (files.length > 20) return { error: "Upload up to 20 files at a time." };

    const category = z.nativeEnum(MediaCategory).safeParse(str(fd, "category") || "GENERAL");
    if (!category.success) return { error: "Unknown category." };
    const isPublic = fd.get("isPublic") === "on";

    let ok = 0;
    const problems: string[] = [];
    for (const file of files) {
      try {
        const saved = await saveMediaFile(file, { category: category.data, isPublic, uploadedById: user.id });
        await audit({ userId: user.id, action: "UPLOAD", entity: "Media", entityId: saved.id, summary: `Uploaded ${saved.originalName}` });
        ok += 1;
      } catch (e) {
        problems.push(e instanceof Error ? e.message : `${file.name} failed.`);
      }
    }
    refresh();
    if (ok === 0) return { error: problems[0] ?? "Upload failed." };
    return { ok: `${ok} file${ok === 1 ? "" : "s"} uploaded${problems.length ? ` (${problems.length} skipped: ${problems.join(" ")})` : "."}` };
  });
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().trim().min(1, "Enter a name.").max(120),
  alt: z.string().trim().max(250).optional(),
  category: z.nativeEnum(MediaCategory),
});

export async function updateMedia(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("media:manage", async (user) => {
    const parsed = UpdateSchema.safeParse({
      id: str(fd, "id"),
      fileName: str(fd, "fileName"),
      alt: str(fd, "alt") || undefined,
      category: str(fd, "category"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
    const d = parsed.data;
    const current = await db.media.findUnique({ where: { id: d.id } });
    if (!current) return { error: "File not found." };

    const wantPublic = fd.get("isPublic") === "on";

    await db.media.update({
      where: { id: d.id },
      data: { fileName: d.fileName, alt: d.alt ?? null, category: d.category, isPublic: wantPublic },
    });
    await audit({ userId: user.id, action: "UPDATE", entity: "Media", entityId: d.id, summary: `Edited ${d.fileName}` });
    refresh();
    return { ok: "File updated." };
  });
}

export async function deleteMedia(fd: FormData): Promise<void> {
  const res = await guarded("media:manage", async (user) => {
    const id = str(fd, "id");
    const m = await db.media.findUnique({ where: { id } });
    if (!m) return;
    await deleteMediaFile(id);
    await audit({ userId: user.id, action: "DELETE", entity: "Media", entityId: id, summary: `Deleted ${m.originalName}` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
}

/** Used by the delete confirmation to list where a file is in use. */
export async function checkMediaUsage(id: string): Promise<string[]> {
  const res = await guarded("media:view", async () => {});
  if (res.error) return [];
  return mediaUsage(id);
}

const AssignSchema = z.object({
  id: z.string().min(1),
  target: z.enum(["project", "service"]),
  targetId: z.string().min(1, "Choose where to use this image."),
  as: z.enum(["gallery", "cover"]),
});

export async function assignMedia(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("media:manage", async (user) => {
    const parsed = AssignSchema.safeParse({
      id: str(fd, "id"),
      target: str(fd, "target"),
      targetId: str(fd, "targetId"),
      as: str(fd, "as"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid selection." };
    const { id, target, targetId, as } = parsed.data;

    const media = await db.media.findUnique({ where: { id } });
    if (!media?.mimeType.startsWith("image/")) return { error: "Only images can be assigned." };

    if (target === "project") {
      if (as === "cover") await db.project.update({ where: { id: targetId }, data: { coverId: id } });
      else
        await db.projectImage.upsert({
          where: { projectId_mediaId: { projectId: targetId, mediaId: id } },
          create: { projectId: targetId, mediaId: id },
          update: {},
        });
    } else if (as === "cover") await db.service.update({ where: { id: targetId }, data: { coverId: id } });
    else
      await db.serviceImage.upsert({
        where: { serviceId_mediaId: { serviceId: targetId, mediaId: id } },
        create: { serviceId: targetId, mediaId: id },
        update: {},
      });

    await audit({ userId: user.id, action: "UPDATE", entity: "Media", entityId: id, summary: `Assigned ${media.fileName} to a ${target} (${as})` });
    refresh();
    revalidatePath("/", "layout");
    return { ok: "Image assigned." };
  });
}
