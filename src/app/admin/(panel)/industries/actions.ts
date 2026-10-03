"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { audit } from "@/server/audit";
import { guarded, fieldErrorsFrom, slugify, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";

const refresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/industries/", "page");
};

const Schema = z.object({
  name: z.string().trim().min(2, "Enter the industry name.").max(120),
  description: z.string().trim().max(600).optional(),
  icon: z.string().trim().max(40).default("Building2"),
  order: z.coerce.number().int().min(0).max(100000).default(0),
  published: z.boolean(),
});

export async function saveIndustry(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("industry:manage", async (user) => {
    const id = str(fd, "id");
    const parsed = Schema.safeParse({
      name: str(fd, "name"),
      description: str(fd, "description") || undefined,
      icon: str(fd, "icon") || "Building2",
      order: str(fd, "order") || "0",
      published: fd.get("published") === "on",
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;
    const slug = slugify(d.name);
    const clash = await db.industry.findFirst({ where: { slug, NOT: id ? { id } : undefined }, select: { id: true } });
    if (clash) return { error: "An industry with this name already exists." };

    const data = { slug, name: d.name, description: d.description ?? null, icon: d.icon, order: d.order, published: d.published };
    const saved = id ? await db.industry.update({ where: { id }, data }) : await db.industry.create({ data });
    await audit({ userId: user.id, action: id ? "UPDATE" : "CREATE", entity: "Industry", entityId: saved.id, summary: `${id ? "Updated" : "Created"} industry “${d.name}”` });
    refresh();
    return { ok: id ? "Industry saved." : "Industry added." };
  });
}

export async function deleteIndustry(fd: FormData): Promise<void> {
  const res = await guarded("industry:manage", async (user) => {
    const id = str(fd, "id");
    const i = await db.industry.findUnique({ where: { id } });
    if (!i) return;
    await db.industry.delete({ where: { id } });
    await audit({ userId: user.id, action: "DELETE", entity: "Industry", entityId: id, summary: `Deleted industry “${i.name}”` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
}
