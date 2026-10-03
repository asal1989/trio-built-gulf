import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { company } from "@/lib/site";
import { db } from "./db";

/**
 * Site settings stored in the `Setting` table.
 *
 * Every getter falls back to the values that used to be hard-coded in
 * src/lib/site.ts, so the public site keeps working if the database is empty
 * or briefly unreachable.
 */

export const PhoneSchema = z.object({
  label: z.string().trim().max(60).default(""),
  number: z.string().trim().max(40),
  whatsapp: z.string().trim().max(20).default(""),
  role: z.string().trim().max(60).default(""),
});

export const ContactSettingsSchema = z.object({
  companyName: z.string().trim().max(120),
  legalName: z.string().trim().max(160),
  phones: z.array(PhoneSchema).max(6),
  /** Primary WhatsApp number, digits only with country code. */
  whatsapp: z.string().trim().max(20),
  email: z.string().trim().email().max(200),
  address: z.string().trim().max(300).default(""),
  city: z.string().trim().max(80).default("Dubai"),
  country: z.string().trim().max(80).default("United Arab Emirates"),
  mapsUrl: z.string().trim().max(600).default(""),
  hours: z.string().trim().max(300).default(""),
  social: z
    .object({
      linkedin: z.string().trim().max(300).default(""),
      instagram: z.string().trim().max(300).default(""),
      facebook: z.string().trim().max(300).default(""),
      x: z.string().trim().max(300).default(""),
      youtube: z.string().trim().max(300).default(""),
    })
    .default({ linkedin: "", instagram: "", facebook: "", x: "", youtube: "" }),
});
export type ContactSettings = z.infer<typeof ContactSettingsSchema>;

export const CrmSettingsSchema = z.object({
  /** Newly arrived website enquiries are assigned to this user, if set. */
  defaultAssigneeId: z.string().trim().max(60).default(""),
  /** Extra addresses that receive "new enquiry" emails. */
  notifyEmails: z.array(z.string().trim().email()).max(10).default([]),
  quoteTerms: z.string().max(4000).default(""),
  quoteValidityDays: z.number().int().min(1).max(365).default(30),
  vatRate: z.number().min(0).max(100).default(5),
  trn: z.string().trim().max(40).default(""),
});
export type CrmSettings = z.infer<typeof CrmSettingsSchema>;

export const DEFAULT_QUOTE_TERMS = [
  "1. Prices are in UAE Dirhams (AED) and are exclusive of VAT unless stated.",
  "2. This quotation is valid until the date shown above.",
  "3. Works start after written confirmation and any required approvals.",
  "4. Variations to the scope will be quoted and agreed in writing before execution.",
  "5. Payment terms are agreed at order confirmation.",
].join("\n");

export const defaultContact = (): ContactSettings => ({
  companyName: company.name,
  legalName: company.legalName,
  phones: [
    { label: "Operations", number: company.phone.label, whatsapp: company.phone.whatsapp, role: "Co-Founder" },
    { label: "Co-Founder", number: company.phoneAlt.label, whatsapp: company.phoneAlt.whatsapp, role: "Co-Founder" },
  ],
  whatsapp: company.phone.whatsapp,
  email: company.email,
  address: "Dubai, United Arab Emirates",
  city: company.city,
  country: company.country,
  mapsUrl: "https://www.google.com/maps?q=Dubai,+United+Arab+Emirates&output=embed",
  hours: "",
  social: { linkedin: "", instagram: "", facebook: "", x: "", youtube: "" },
});

export const defaultCrm = (): CrmSettings => ({
  defaultAssigneeId: "",
  notifyEmails: [],
  quoteTerms: DEFAULT_QUOTE_TERMS,
  quoteValidityDays: 30,
  vatRate: 5,
  trn: "",
});

async function readSetting<T>(key: string, schema: z.ZodType<T>, fallback: () => T): Promise<T> {
  try {
    const row = await db.setting.findUnique({ where: { key } });
    if (!row) return fallback();
    const parsed = schema.safeParse({ ...(fallback() as object), ...(row.value as object) });
    return parsed.success ? parsed.data : fallback();
  } catch (error) {
    console.error(`settings: could not read "${key}", using defaults`, error);
    return fallback();
  }
}

/** Public site: cached, refreshed when an admin saves settings (tag "settings"). */
export const getContactSettings = unstable_cache(
  () => readSetting("contact", ContactSettingsSchema, defaultContact),
  ["setting-contact"],
  { tags: ["settings"], revalidate: 3600 },
);

/** Admin/CRM: always fresh. */
export const getCrmSettings = () => readSetting("crm", CrmSettingsSchema, defaultCrm);
export const getContactSettingsFresh = () => readSetting("contact", ContactSettingsSchema, defaultContact);

/** Convenience: the primary phone as {label, href, whatsapp}. */
export function primaryPhone(c: ContactSettings) {
  const p = c.phones[0];
  const number = p?.number ?? company.phone.label;
  return {
    label: number,
    href: `tel:${number.replace(/[^+\d]/g, "")}`,
    whatsapp: p?.whatsapp || c.whatsapp,
  };
}
