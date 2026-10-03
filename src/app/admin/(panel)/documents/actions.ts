"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { DocumentType, type MediaCategory } from "@/generated/prisma/enums";
import { audit } from "@/server/audit";
import { guarded, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";
import { deleteMediaFile, saveMediaFile } from "@/server/media/store";

const refresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/documents/", "page");
};

const categoryFor = (t: DocumentType): MediaCategory =>
  t === "CERTIFICATE" ? "CERTIFICATE" : t === "BROCHURE" ? "BROCHURE" : "DOCUMENT";

const Schema = z.object({
  type: z.nativeEnum(DocumentType),
  title: z.string().trim().min(2, "Enter a title.").max(160),
  description: z.string().trim().max(400).optional(),
  order: z.coerce.number().int().min(0).max(100000).default(0),
});

export async function saveDocument(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("document:manage", async (user) => {
    const id = str(fd, "id");
    const parsed = Schema.safeParse({
      type: str(fd, "type") || "OTHER",
      title: str(fd, "title"),
      description: str(fd, "description") || undefined,
      order: str(fd, "order") || "0",
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
    const d = parsed.data;
    const isPublic = fd.get("isPublic") === "on";
    const file = fd.get("file");
    const hasFile = file instanceof File && file.size > 0;

    const existing = id ? await db.document.findUnique({ where: { id } }) : null;
    if (id && !existing) return { error: "Document not found." };
    if (!id && !hasFile) return { error: "Choose a file to upload." };

    let mediaId = existing?.mediaId ?? null;
    if (hasFile) {
      let saved;
      try {
        saved = await saveMediaFile(file, { category: categoryFor(d.type), isPublic, uploadedById: user.id });
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Upload failed." };
      }
      // Replace: remove the previous file from storage.
      if (existing?.mediaId) await deleteMediaFile(existing.mediaId);
      mediaId = saved.id;
      await audit({ userId: user.id, action: "UPLOAD", entity: "Document", entityId: id || saved.id, summary: `${existing ? "Replaced" : "Uploaded"} file for “${d.title}”` });
    } else if (mediaId && existing && existing.isPublic !== isPublic) {
      await db.media.update({ where: { id: mediaId }, data: { isPublic } });
    }

    const data = { type: d.type, title: d.title, description: d.description ?? null, order: d.order, isPublic, mediaId };
    const saved = id ? await db.document.update({ where: { id }, data }) : await db.document.create({ data });
    await audit({
      userId: user.id,
      action: id ? "UPDATE" : "CREATE",
      entity: "Document",
      entityId: saved.id,
      summary: `${id ? "Updated" : "Created"} document “${d.title}” (${isPublic ? "public" : "private"})`,
    });
    refresh();
    return { ok: id ? "Document saved." : "Document uploaded." };
  });
}

export async function deleteDocument(fd: FormData): Promise<void> {
  const res = await guarded("document:manage", async (user) => {
    const id = str(fd, "id");
    const doc = await db.document.findUnique({ where: { id } });
    if (!doc) return;
    await db.document.delete({ where: { id } });
    if (doc.mediaId) await deleteMediaFile(doc.mediaId);
    await audit({ userId: user.id, action: "DELETE", entity: "Document", entityId: id, summary: `Deleted document “${doc.title}”` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
}
