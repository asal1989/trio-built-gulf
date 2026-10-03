"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { audit } from "@/server/audit";
import { guarded, str, type ActionResult } from "@/server/action-helpers";
import { contentDef } from "@/server/content/defaults";
import { db } from "@/server/db";

const refresh = () => {
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/content/", "page");
};

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim().slice(0, max) : "");

function json(fd: FormData, key: string): unknown {
  try {
    return JSON.parse(str(fd, key) || "null");
  } catch {
    return null;
  }
}

/** Build the data object from the form, validating strictly against the content definition. */
export async function saveContent(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("content:manage", async (user) => {
    const key = str(fd, "key");
    const def = contentDef(key);
    if (!def) return { error: "Unknown content section." };

    const data: Record<string, unknown> = {};
    for (const f of def.fields) {
      if (f.kind === "text") data[f.key] = clip(fd.get(f.key), f.max ?? 300);
      else if (f.kind === "textarea") data[f.key] = clip(fd.get(f.key), f.max ?? 2000);
      else if (f.kind === "list") {
        const raw = json(fd, f.key);
        data[f.key] = Array.isArray(raw) ? raw.map((x) => clip(x, 1500)).filter(Boolean).slice(0, 60) : [];
      } else {
        const raw = json(fd, f.key);
        const rows = Array.isArray(raw) ? raw : [];
        data[f.key] = rows
          .slice(0, 60)
          .map((row) => Object.fromEntries(f.fields.map((sub) => [sub.key, clip((row as Record<string, unknown>)?.[sub.key], 1500)])))
          .filter((row) => Object.values(row).some(Boolean));
      }
    }

    if (def.group === "page") {
      await db.page.upsert({ where: { slug: key }, update: { title: def.title, content: data as never }, create: { slug: key, title: def.title, content: data as never } });
    } else {
      await db.contentBlock.upsert({ where: { key }, update: { title: def.title, data: data as never }, create: { key, title: def.title, data: data as never } });
    }
    await audit({ userId: user.id, action: "UPDATE", entity: "Content", entityId: key, summary: `Edited website content “${def.title}”` });
    refresh();
    return { ok: `“${def.title}” saved — the website is updated.` };
  });
}

export async function resetContent(fd: FormData): Promise<void> {
  const res = await guarded("content:manage", async (user) => {
    const key = str(fd, "key");
    const def = contentDef(key);
    if (!def) return;
    if (def.group === "page") await db.page.deleteMany({ where: { slug: key } });
    else await db.contentBlock.deleteMany({ where: { key } });
    await audit({ userId: user.id, action: "UPDATE", entity: "Content", entityId: key, summary: `Reset “${def.title}” to the standard text` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
}
