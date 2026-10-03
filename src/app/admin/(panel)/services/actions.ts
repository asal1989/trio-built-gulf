"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/server/audit";
import { guarded, fieldErrorsFrom, slugify, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";

const publicRefresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/services/", "page");
};

/** JSON array coming from a hidden input; invalid JSON becomes an empty list. */
const jsonArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((v) => {
    if (typeof v !== "string" || !v) return [];
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }, z.array(item).max(60));

const text = (max: number) => z.string().trim().max(max);

const ServiceSchema = z.object({
  name: text(160).min(2, "Enter the service name."),
  label: text(80).min(2, "Enter a short label."),
  slug: text(80).optional(),
  shortDescription: text(400).min(5, "Add a short description."),
  fullDescription: text(6000).optional(),
  headingLead: text(80).optional(),
  headingAccent: text(40).optional(),
  icon: text(40).default("Wrench"),
  coverId: text(60).optional(),
  gallery: z.array(z.string().max(60)).max(40).default([]),
  features: jsonArray(text(160)),
  intro: jsonArray(text(1200)),
  scope: jsonArray(z.object({ title: text(120), text: text(500) })),
  whenTitle: text(160).optional(),
  whenItems: jsonArray(text(400)),
  approach: jsonArray(z.object({ title: text(120), text: text(500) })),
  faqs: jsonArray(z.object({ q: text(300), a: text(1500) })),
  related: z.array(z.string().max(80)).max(12).default([]),
  whatsappMessage: text(300).optional(),
  seoTitle: text(120).optional(),
  seoDescription: text(300).optional(),
  order: z.coerce.number().int().min(0).max(100000).default(0),
  published: z.boolean(),
});

function parse(fd: FormData) {
  const opt = (k: string) => str(fd, k) || undefined;
  return ServiceSchema.safeParse({
    name: str(fd, "name"),
    label: str(fd, "label"),
    slug: opt("slug"),
    shortDescription: str(fd, "shortDescription"),
    fullDescription: opt("fullDescription"),
    headingLead: opt("headingLead"),
    headingAccent: opt("headingAccent"),
    icon: str(fd, "icon") || "Wrench",
    coverId: opt("coverId"),
    gallery: fd.getAll("gallery").map(String).filter(Boolean),
    features: str(fd, "features"),
    intro: str(fd, "intro"),
    scope: str(fd, "scope"),
    whenTitle: opt("whenTitle"),
    whenItems: str(fd, "whenItems"),
    approach: str(fd, "approach"),
    faqs: str(fd, "faqs"),
    related: fd.getAll("related").map(String).filter(Boolean),
    whatsappMessage: opt("whatsappMessage"),
    seoTitle: opt("seoTitle"),
    seoDescription: opt("seoDescription"),
    order: str(fd, "order") || "0",
    published: fd.get("published") === "on",
  });
}

export async function saveService(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("service:manage", async (user) => {
    const id = str(fd, "id");
    const parsed = parse(fd);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;

    const slug = slugify(d.slug || d.label);
    if (!slug) return { error: "Enter a URL slug." };
    const clash = await db.service.findFirst({ where: { slug, NOT: id ? { id } : undefined }, select: { id: true } });
    if (clash) return { error: `The slug "${slug}" is already used by another service.` };

    const data = {
      slug,
      name: d.name,
      label: d.label,
      shortDescription: d.shortDescription,
      fullDescription: d.fullDescription ?? null,
      headingLead: d.headingLead ?? null,
      headingAccent: d.headingAccent ?? null,
      icon: d.icon,
      coverId: d.coverId || null,
      intro: d.intro,
      scope: d.scope.filter((s) => s.title || s.text),
      whenTitle: d.whenTitle ?? null,
      whenItems: d.whenItems,
      approach: d.approach.filter((s) => s.title || s.text),
      faqs: d.faqs.filter((f) => f.q && f.a),
      related: d.related.filter((r) => r !== slug),
      whatsappMessage: d.whatsappMessage ?? null,
      seoTitle: d.seoTitle ?? null,
      seoDescription: d.seoDescription ?? null,
      order: d.order,
      published: d.published,
    };

    let savedId = id;
    await db.$transaction(async (tx) => {
      if (id) {
        await tx.service.update({ where: { id }, data });
        await tx.serviceFeature.deleteMany({ where: { serviceId: id } });
        await tx.serviceImage.deleteMany({ where: { serviceId: id } });
      } else {
        savedId = (await tx.service.create({ data })).id;
      }
      if (d.features.length) await tx.serviceFeature.createMany({ data: d.features.map((text, order) => ({ serviceId: savedId, text, order })) });
      if (d.gallery.length) await tx.serviceImage.createMany({ data: d.gallery.map((mediaId, order) => ({ serviceId: savedId, mediaId, order })), skipDuplicates: true });
    });

    await audit({ userId: user.id, action: id ? "UPDATE" : "CREATE", entity: "Service", entityId: savedId, summary: `${id ? "Updated" : "Created"} service “${d.label}”${d.published ? "" : " (draft)"}` });
    publicRefresh();
    return { ok: id ? "Service saved." : "Service created.", id: savedId };
  });
}

export async function toggleServicePublished(fd: FormData): Promise<void> {
  const res = await guarded("service:manage", async (user) => {
    const id = str(fd, "id");
    const s = await db.service.findUnique({ where: { id } });
    if (!s) return;
    await db.service.update({ where: { id }, data: { published: !s.published } });
    await audit({ userId: user.id, action: "UPDATE", entity: "Service", entityId: id, summary: `${s.published ? "Unpublished" : "Published"} service “${s.label}”` });
  });
  if (res.error) throw new Error(res.error);
  publicRefresh();
}

export async function deleteService(fd: FormData): Promise<void> {
  const res = await guarded("service:manage", async (user) => {
    const id = str(fd, "id");
    const s = await db.service.findUnique({ where: { id } });
    if (!s) return;
    await db.service.delete({ where: { id } });
    await audit({ userId: user.id, action: "DELETE", entity: "Service", entityId: id, summary: `Deleted service “${s.label}”` });
  });
  if (res.error) throw new Error(res.error);
  publicRefresh();
  redirect("/admin/services/");
}
