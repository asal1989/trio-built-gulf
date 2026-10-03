"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { audit } from "@/server/audit";
import { guarded, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";
import { ContactSettingsSchema, CrmSettingsSchema, PhoneSchema } from "@/server/settings";

const refreshSite = () => {
  revalidateTag("settings", "max");
  revalidateTag("content", "max");
  revalidatePath("/", "layout");
};

const digits = (s: string) => s.replace(/\D/g, "");

const phonesJson = z.preprocess((v) => {
  try {
    return typeof v === "string" ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}, z.array(PhoneSchema).min(1, "Add at least one phone number.").max(6));

const urlOrEmpty = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Use a full link starting with https://");

export async function saveContactSettings(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("settings:manage", async (user) => {
    const parsedPhones = phonesJson.safeParse(str(fd, "phones"));
    if (!parsedPhones.success) return { error: parsedPhones.error.issues[0]?.message ?? "Check the phone numbers." };

    const phones = parsedPhones.data.map((p) => ({ ...p, whatsapp: digits(p.whatsapp) }));
    const social = z
      .object({ linkedin: urlOrEmpty, instagram: urlOrEmpty, facebook: urlOrEmpty, x: urlOrEmpty, youtube: urlOrEmpty })
      .safeParse({ linkedin: str(fd, "linkedin"), instagram: str(fd, "instagram"), facebook: str(fd, "facebook"), x: str(fd, "x"), youtube: str(fd, "youtube") });
    if (!social.success) return { error: social.error.issues[0]?.message ?? "Check the social links." };

    const mapsUrl = urlOrEmpty.safeParse(str(fd, "mapsUrl"));
    if (!mapsUrl.success) return { error: "The map link must start with https://" };

    const parsed = ContactSettingsSchema.safeParse({
      companyName: str(fd, "companyName"),
      legalName: str(fd, "legalName"),
      phones,
      whatsapp: digits(str(fd, "whatsapp")),
      email: str(fd, "email"),
      address: str(fd, "address"),
      city: str(fd, "city") || "Dubai",
      country: str(fd, "country") || "United Arab Emirates",
      mapsUrl: mapsUrl.data,
      hours: str(fd, "hours"),
      social: social.data,
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
    if (parsed.data.whatsapp.length < 8) return { error: "Enter the WhatsApp number with country code, e.g. 971525073289." };

    await db.setting.upsert({ where: { key: "contact" }, update: { value: parsed.data }, create: { key: "contact", value: parsed.data } });
    await audit({ userId: user.id, action: "UPDATE", entity: "Setting", entityId: "contact", summary: "Updated contact settings" });
    refreshSite();
    return { ok: "Contact settings saved — the website now uses them everywhere." };
  });
}

export async function saveCrmSettings(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("settings:manage", async (user) => {
    const emails = str(fd, "notifyEmails")
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const parsed = CrmSettingsSchema.safeParse({
      defaultAssigneeId: str(fd, "defaultAssigneeId"),
      notifyEmails: emails,
      quoteTerms: str(fd, "quoteTerms"),
      quoteValidityDays: Number(str(fd, "quoteValidityDays") || 30),
      vatRate: Number(str(fd, "vatRate") || 5),
      trn: str(fd, "trn"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form (are the notification emails valid?)." };

    await db.setting.upsert({ where: { key: "crm" }, update: { value: parsed.data }, create: { key: "crm", value: parsed.data } });
    await audit({ userId: user.id, action: "UPDATE", entity: "Setting", entityId: "crm", summary: "Updated CRM and quotation settings" });
    revalidatePath("/admin/settings/", "page");
    return { ok: "CRM settings saved." };
  });
}
