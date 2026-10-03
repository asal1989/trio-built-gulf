import "server-only";
import sharp from "sharp";
import type { MediaCategory } from "@/generated/prisma/enums";
import { db } from "../db";
import { makeStorageKey, storage } from "../storage";
import { ADMIN_MEDIA_RULES, validateUpload, type UploadRules } from "../uploads";

export type StoredMedia = Awaited<ReturnType<typeof saveMediaFile>>;

const MAX_DIMENSION = 2400;

/**
 * Validate, optimise and store one uploaded file, then record its metadata.
 * Images are re-encoded (this also strips EXIF/GPS data) and capped at 2400 px.
 */
export async function saveMediaFile(
  file: File,
  opts: { category: MediaCategory; isPublic: boolean; uploadedById: string; alt?: string; rules?: UploadRules },
) {
  const checked = await validateUpload(file, opts.rules ?? ADMIN_MEDIA_RULES);
  if (!checked.ok) throw new Error(checked.error);

  let buffer = checked.buffer;
  const mime = checked.detected.mime;
  let ext = checked.detected.ext;
  let width: number | undefined;
  let height: number | undefined;

  if (checked.detected.kind === "image") {
    const pipeline = sharp(buffer, { failOn: "error" }).rotate().resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
    if (mime === "image/png") pipeline.png({ compressionLevel: 9 });
    else if (mime === "image/webp") pipeline.webp({ quality: 84 });
    else pipeline.jpeg({ quality: 84, mozjpeg: true });
    const out = await pipeline.toBuffer({ resolveWithObject: true });
    buffer = out.data;
    width = out.info.width;
    height = out.info.height;
    ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  }

  const baseName = checked.name.replace(/\.[A-Za-z0-9]{1,8}$/, "");
  const key = makeStorageKey(opts.isPublic ? "media" : "private", `${baseName}.${ext}`);
  await storage().put(key, buffer, mime);

  return db.media.create({
    data: {
      storageKey: key,
      fileName: `${baseName}.${ext}`,
      originalName: checked.name,
      mimeType: mime,
      size: buffer.length,
      width,
      height,
      category: opts.category,
      alt: opts.alt,
      isPublic: opts.isPublic,
      uploadedById: opts.uploadedById,
    },
  });
}

export async function deleteMediaFile(id: string): Promise<void> {
  const m = await db.media.findUnique({ where: { id } });
  if (!m) return;
  await storage().delete(m.storageKey).catch((e) => console.error("storage delete failed", e));
  await db.media.delete({ where: { id } });
}

/** Where a media item is referenced — shown before deleting. */
export async function mediaUsage(id: string): Promise<string[]> {
  const [svc, svcImg, prj, prjImg, tst, doc, seo] = await Promise.all([
    db.service.findMany({ where: { coverId: id }, select: { name: true } }),
    db.serviceImage.findMany({ where: { mediaId: id }, include: { service: { select: { name: true } } } }),
    db.project.findMany({ where: { coverId: id }, select: { name: true } }),
    db.projectImage.findMany({ where: { mediaId: id }, include: { project: { select: { name: true } } } }),
    db.testimonial.findMany({ where: { photoId: id }, select: { name: true } }),
    db.document.findMany({ where: { mediaId: id }, select: { title: true } }),
    db.seoMetadata.findMany({ where: { ogImageId: id }, select: { path: true } }),
  ]);
  return [
    ...svc.map((s) => `Service cover: ${s.name}`),
    ...svcImg.map((s) => `Service gallery: ${s.service.name}`),
    ...prj.map((p) => `Project cover: ${p.name}`),
    ...prjImg.map((p) => `Project gallery: ${p.project.name}`),
    ...tst.map((t) => `Testimonial: ${t.name}`),
    ...doc.map((d) => `Document: ${d.title}`),
    ...seo.map((s) => `Social image: ${s.path}`),
  ];
}
