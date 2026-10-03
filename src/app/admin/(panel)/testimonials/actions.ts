"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { audit } from "@/server/audit";
import { guarded, fieldErrorsFrom, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";

const refresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/testimonials/", "page");
};

const Schema = z.object({
  name: z.string().trim().min(2, "Enter the customer name.").max(100),
  company: z.string().trim().max(120).optional(),
  position: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(10, "Enter the testimonial (at least 10 characters).").max(1500),
  photoId: z.string().trim().max(60).optional(),
  order: z.coerce.number().int().min(0).max(100000).default(0),
  published: z.boolean(),
});

export async function saveTestimonial(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("testimonial:manage", async (user) => {
    const id = str(fd, "id");
    const parsed = Schema.safeParse({
      name: str(fd, "name"),
      company: str(fd, "company") || undefined,
      position: str(fd, "position") || undefined,
      quote: str(fd, "quote"),
      photoId: str(fd, "photoId") || undefined,
      order: str(fd, "order") || "0",
      published: fd.get("published") === "on",
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;
    const data = { name: d.name, company: d.company ?? null, position: d.position ?? null, quote: d.quote, photoId: d.photoId || null, order: d.order, published: d.published };
    const saved = id ? await db.testimonial.update({ where: { id }, data }) : await db.testimonial.create({ data });
    await audit({ userId: user.id, action: id ? "UPDATE" : "CREATE", entity: "Testimonial", entityId: saved.id, summary: `${id ? "Updated" : "Added"} testimonial from ${d.name}` });
    refresh();
    return { ok: id ? "Testimonial saved." : "Testimonial added." };
  });
}

export async function deleteTestimonial(fd: FormData): Promise<void> {
  const res = await guarded("testimonial:manage", async (user) => {
    const id = str(fd, "id");
    const t = await db.testimonial.findUnique({ where: { id } });
    if (!t) return;
    await db.testimonial.delete({ where: { id } });
    await audit({ userId: user.id, action: "DELETE", entity: "Testimonial", entityId: id, summary: `Deleted testimonial from ${t.name}` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
}
