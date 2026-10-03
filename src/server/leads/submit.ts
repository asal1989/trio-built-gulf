import "server-only";
import { z } from "zod";
import type { LeadType } from "@/generated/prisma/enums";
import { db } from "../db";
import { makeStorageKey, storage } from "../storage";
import { notifyAdmins, notifyUsers } from "../notifications";
import { getContactSettingsFresh, getCrmSettings } from "../settings";
import { leadCode } from "../email/templates";
import type { DetectedFile } from "../uploads";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Server-side validation of the public enquiry form. Never trusts the browser. */
export const EnquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  company: optional(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9()\-.\s]{7,24}$/, "Please enter a valid phone number.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Please enter a valid phone number."),
  whatsapp: z
    .string()
    .trim()
    .max(24)
    .regex(/^[+0-9()\-.\s]*$/, "Please enter a valid WhatsApp number.")
    .optional()
    .transform((v) => (v ? v : undefined)),
  service: z.string().trim().min(1, "Please select the service you need.").max(160),
  projectType: optional(80),
  location: optional(160),
  area: optional(60),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  budget: optional(80),
  message: z.string().trim().min(10, "Please add a little more detail (10 characters or more).").max(4000),
});
export type EnquiryInput = z.infer<typeof EnquirySchema>;

export type ValidatedFile = { name: string; buffer: Buffer; detected: DetectedFile };

function leadTypeFor(input: EnquiryInput): LeadType {
  const hay = `${input.service} ${input.projectType ?? ""}`.toLowerCase();
  if (/maintenance|amc/.test(hay)) return "MAINTENANCE";
  if (/general/.test(hay)) return "GENERAL";
  return "QUOTE";
}

export type CreatedLead = {
  id: string;
  number: number;
  assigneeEmail: string | null;
  assigneeId: string | null;
  attachmentCount: number;
  notifyEmails: string[];
  contactPhone: string;
};

export async function createLeadFromSubmission(
  input: EnquiryInput,
  files: ValidatedFile[],
  meta: { ip: string | null; userAgent: string | null },
): Promise<CreatedLead> {
  const [crm, contact] = await Promise.all([getCrmSettings(), getContactSettingsFresh()]);

  const service = await db.service.findFirst({
    where: { OR: [{ name: input.service }, { label: input.service }] },
    select: { id: true },
  });

  let assigneeId: string | null = null;
  let assigneeEmail: string | null = null;
  if (crm.defaultAssigneeId) {
    const u = await db.user.findFirst({
      where: { id: crm.defaultAssigneeId, active: true },
      select: { id: true, email: true },
    });
    if (u) {
      assigneeId = u.id;
      assigneeEmail = u.email;
    }
  }

  const lead = await db.lead.create({
    data: {
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      serviceId: service?.id,
      serviceLabel: input.service,
      projectType: input.projectType,
      location: input.location,
      area: input.area,
      expectedStart: input.startDate ? new Date(`${input.startDate}T00:00:00Z`) : undefined,
      budget: input.budget,
      message: input.message,
      type: leadTypeFor(input),
      assignedToId: assigneeId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      activities: {
        create: [
          { type: "CREATED", summary: "Enquiry received from the website" },
          ...(assigneeId ? [{ type: "ASSIGNED", summary: "Auto-assigned to the default sales owner" }] : []),
        ],
      },
    },
  });

  // Files go to private object storage; only metadata is kept in the database.
  let saved = 0;
  for (const f of files) {
    const key = makeStorageKey(`enquiries/${lead.number}`, f.name);
    try {
      await storage().put(key, f.buffer, f.detected.mime);
      await db.leadAttachment.create({
        data: { leadId: lead.id, storageKey: key, fileName: f.name, mimeType: f.detected.mime, size: f.buffer.length },
      });
      saved += 1;
    } catch (error) {
      console.error("attachment upload failed", error);
    }
  }
  if (saved) {
    await db.leadActivity.create({
      data: { leadId: lead.id, type: "ATTACHMENT", summary: `${saved} file(s) uploaded with the enquiry` },
    });
  }

  await notifyAdmins(
    {
      type: "lead.new",
      title: `New enquiry ${leadCode(lead.number)} — ${lead.name}`,
      body: [lead.serviceLabel, lead.location].filter(Boolean).join(" · "),
      link: `/admin/leads/${lead.id}/`,
    },
    [assigneeId],
  );
  if (assigneeId) {
    await notifyUsers([assigneeId], {
      type: "lead.assigned",
      title: `Enquiry ${leadCode(lead.number)} assigned to you`,
      body: lead.name,
      link: `/admin/leads/${lead.id}/`,
    });
  }

  return {
    id: lead.id,
    number: lead.number,
    assigneeId,
    assigneeEmail,
    attachmentCount: saved,
    notifyEmails: crm.notifyEmails.length ? crm.notifyEmails : [contact.email],
    contactPhone: contact.phones[0]?.number ?? contact.email,
  };
}
