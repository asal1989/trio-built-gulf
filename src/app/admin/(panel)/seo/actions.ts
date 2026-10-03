"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { audit } from "@/server/audit";
import { guarded, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";

const refresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo/", "page");
};

const optionalText = (max: number) => z.string().trim().max(max).optional();

const Schema = z.object({
  path: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9\-_/]*$/, "Invalid page path.")
    .max(200),
  title: optionalText(120),
  description: optionalText(320),
  canonicalUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^(https?:\/\/|\/)/i.test(v), "Canonical must be a full link or a path starting with /")
    .optional(),
  ogTitle: optionalText(120),
  ogDescription: optionalText(320),
  ogImageId: optionalText(60),
  robots: z.enum(["", "index, follow", "noindex, follow", "noindex, nofollow"]).default(""),
});

export async function saveSeo(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("seo:manage", async (user) => {
    const parsed = Schema.safeParse({
      path: str(fd, "path"),
      title: str(fd, "title") || undefined,
      description: str(fd, "description") || undefined,
      canonicalUrl: str(fd, "canonicalUrl") || undefined,
      ogTitle: str(fd, "ogTitle") || undefined,
      ogDescription: str(fd, "ogDescription") || undefined,
      ogImageId: str(fd, "ogImageId") || undefined,
      robots: str(fd, "robots"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
    const d = parsed.data;

    const data = {
      title: d.title ?? null,
      description: d.description ?? null,
      canonicalUrl: d.canonicalUrl || null,
      ogTitle: d.ogTitle ?? null,
      ogDescription: d.ogDescription ?? null,
      ogImageId: d.ogImageId || null,
      robots: d.robots || null,
    };
    await db.seoMetadata.upsert({ where: { path: d.path }, update: data, create: { path: d.path, ...data } });
    await audit({ userId: user.id, action: "UPDATE", entity: "SEO", entityId: d.path, summary: `Updated SEO for ${d.path}` });
    refresh();
    return { ok: `SEO for ${d.path} saved.` };
  });
}

export async function resetSeo(fd: FormData): Promise<void> {
  const res = await guarded("seo:manage", async (user) => {
    const path = str(fd, "path");
    await db.seoMetadata.deleteMany({ where: { path } });
    await audit({ userId: user.id, action: "UPDATE", entity: "SEO", entityId: path, summary: `Reset SEO for ${path} to defaults` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
}
