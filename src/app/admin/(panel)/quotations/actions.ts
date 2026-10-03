"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/server/audit";
import { guarded, fieldErrorsFrom, str, type ActionResult } from "@/server/action-helpers";
import { db } from "@/server/db";
import { FROM, sendEmail } from "@/server/email/send";
import { quotationDecisionEmail, quotationSentEmail } from "@/server/email/templates";
import { notifyAdmins } from "@/server/notifications";
import { computeTotals, quoteNumber } from "@/server/quotations/calc";
import { renderQuotationPdf, type QuotePdfData } from "@/server/quotations/pdf";
import { getContactSettingsFresh, getCrmSettings } from "@/server/settings";

const refresh = (id?: string) => {
  revalidatePath("/admin/quotations/", "page");
  if (id) revalidatePath(`/admin/quotations/${id}/`);
  revalidatePath("/admin/");
};

const ItemSchema = z.object({
  description: z.string().trim().min(1, "Describe each line item.").max(600),
  quantity: z.coerce.number().positive("Quantity must be greater than 0.").max(1_000_000),
  unit: z.string().trim().min(1).max(20).default("nos"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative.").max(100_000_000),
});

const QuoteSchema = z.object({
  customerName: z.string().trim().min(2, "Enter the customer name.").max(100),
  companyName: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Enter a valid email.").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  projectName: z.string().trim().max(160).optional(),
  projectLocation: z.string().trim().max(160).optional(),
  description: z.string().trim().max(3000).optional(),
  taxRate: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0).max(100_000_000).default(0),
  terms: z.string().trim().max(6000).optional(),
  validUntil: z.string().trim().optional(),
  leadId: z.string().trim().max(60).optional(),
  items: z.array(ItemSchema).min(1, "Add at least one line item.").max(80),
});

/** Parse the repeated line-item fields (item_description[], item_quantity[] …). */
function parseForm(fd: FormData) {
  const desc = fd.getAll("item_description").map(String);
  const qty = fd.getAll("item_quantity").map(String);
  const unit = fd.getAll("item_unit").map(String);
  const price = fd.getAll("item_unitPrice").map(String);
  const items = desc
    .map((d, i) => ({ description: d, quantity: qty[i] ?? "1", unit: unit[i] || "nos", unitPrice: price[i] ?? "0" }))
    .filter((it) => it.description.trim() !== "");

  const opt = (k: string) => str(fd, k) || undefined;
  return QuoteSchema.safeParse({
    customerName: str(fd, "customerName"),
    companyName: opt("companyName"),
    email: str(fd, "email"),
    phone: opt("phone"),
    projectName: opt("projectName"),
    projectLocation: opt("projectLocation"),
    description: opt("description"),
    taxRate: str(fd, "taxRate") || "5",
    discount: str(fd, "discount") || "0",
    terms: opt("terms"),
    validUntil: opt("validUntil"),
    leadId: opt("leadId"),
    items,
  });
}

function itemsData(items: z.infer<typeof ItemSchema>[], totals: ReturnType<typeof computeTotals>) {
  return items.map((it, i) => ({
    position: i,
    description: it.description,
    quantity: it.quantity,
    unit: it.unit,
    unitPrice: it.unitPrice,
    lineTotal: totals.lines[i],
  }));
}

/* ------------------------------ create --------------------------------- */

export async function createQuotation(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("quote:manage", async (user) => {
    const parsed = parseForm(fd);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Please check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    }
    const d = parsed.data;
    const totals = computeTotals(d.items, d.discount, d.taxRate);

    const created = await db.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          number: `PENDING-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          leadId: d.leadId || null,
          createdById: user.id,
          customerName: d.customerName,
          companyName: d.companyName,
          email: d.email || null,
          phone: d.phone,
          projectName: d.projectName,
          projectLocation: d.projectLocation,
          description: d.description,
          taxRate: d.taxRate,
          discount: totals.discount,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          terms: d.terms,
          validUntil: d.validUntil ? new Date(`${d.validUntil}T23:59:59+04:00`) : null,
          items: { create: itemsData(d.items, totals) },
        },
      });
      return tx.quotation.update({ where: { id: q.id }, data: { number: quoteNumber(new Date().getFullYear(), q.seq) } });
    });

    if (created.leadId) {
      await db.leadActivity.create({
        data: { leadId: created.leadId, userId: user.id, type: "QUOTE", summary: `Quotation ${created.number} drafted` },
      });
    }
    await audit({ userId: user.id, action: "CREATE", entity: "Quotation", entityId: created.id, summary: `Created quotation ${created.number}` });
    refresh(created.id);
    return { ok: `Quotation ${created.number} saved as draft.`, id: created.id };
  });
}

/* ------------------------------ update --------------------------------- */

export async function updateQuotation(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("quote:manage", async (user) => {
    const id = str(fd, "id");
    const existing = await db.quotation.findUnique({ where: { id } });
    if (!existing) return { error: "Quotation not found." };
    if (existing.status !== "DRAFT") return { error: "Only drafts can be edited. Duplicate it to make a revised version." };

    const parsed = parseForm(fd);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Please check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    }
    const d = parsed.data;
    const totals = computeTotals(d.items, d.discount, d.taxRate);

    await db.$transaction([
      db.quotationItem.deleteMany({ where: { quotationId: id } }),
      db.quotation.update({
        where: { id },
        data: {
          customerName: d.customerName,
          companyName: d.companyName ?? null,
          email: d.email || null,
          phone: d.phone ?? null,
          projectName: d.projectName ?? null,
          projectLocation: d.projectLocation ?? null,
          description: d.description ?? null,
          taxRate: d.taxRate,
          discount: totals.discount,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          terms: d.terms ?? null,
          validUntil: d.validUntil ? new Date(`${d.validUntil}T23:59:59+04:00`) : null,
          items: { create: itemsData(d.items, totals) },
        },
      }),
    ]);
    await audit({ userId: user.id, action: "UPDATE", entity: "Quotation", entityId: id, summary: `Edited quotation ${existing.number}` });
    refresh(id);
    return { ok: "Draft saved." };
  });
}

/* ------------------------- send / status changes ----------------------- */

async function loadPdfData(id: string) {
  const q = await db.quotation.findUnique({ where: { id }, include: { items: { orderBy: { position: "asc" } } } });
  if (!q) return null;
  const data: QuotePdfData = {
    number: q.number,
    status: q.status,
    createdAt: q.createdAt,
    validUntil: q.validUntil,
    customerName: q.customerName,
    companyName: q.companyName,
    email: q.email,
    phone: q.phone,
    projectName: q.projectName,
    projectLocation: q.projectLocation,
    description: q.description,
    currency: q.currency,
    taxRate: Number(q.taxRate),
    items: q.items.map((i) => ({
      description: i.description,
      quantity: Number(i.quantity),
      unit: i.unit,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
    subtotal: Number(q.subtotal),
    discount: Number(q.discount),
    taxAmount: Number(q.taxAmount),
    total: Number(q.total),
    terms: q.terms,
  };
  return { q, data };
}

export async function sendQuotation(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("quote:send", async (user) => {
    const id = str(fd, "id");
    const loaded = await loadPdfData(id);
    if (!loaded) return { error: "Quotation not found." };
    const { q, data } = loaded;
    if (!q.email) return { error: "Add the customer's email address before sending." };
    if (q.status === "ACCEPTED" || q.status === "REJECTED") return { error: "This quotation has already been answered." };

    const [contact, crm] = await Promise.all([getContactSettingsFresh(), getCrmSettings()]);
    const pdf = await renderQuotationPdf(data, contact, crm);
    const mail = quotationSentEmail(
      {
        customer: q.customerName,
        number: q.number,
        total: `${q.currency} ${Number(q.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        validUntil: q.validUntil?.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Dubai" }),
        project: q.projectName,
      },
      contact.phones[0]?.number ?? contact.email,
    );
    const result = await sendEmail({
      to: q.email,
      from: FROM.sales,
      replyTo: user.email,
      subject: mail.subject,
      html: mail.html,
      attachments: [{ filename: `${q.number}.pdf`, content: pdf }],
    });
    if (!result.ok) return { error: `The email could not be sent (${result.error ?? "unknown error"}). The quotation was not marked as sent.` };

    await db.quotation.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });
    if (q.leadId) {
      const lead = await db.lead.findUnique({ where: { id: q.leadId } });
      if (lead && ["NEW", "CONTACTED", "SITE_VISIT"].includes(lead.status)) {
        await db.lead.update({ where: { id: lead.id }, data: { status: "QUOTATION_SENT" } });
        await db.leadActivity.create({
          data: { leadId: lead.id, userId: user.id, type: "STATUS", summary: "Status changed to Quotation sent" },
        });
      }
      await db.leadActivity.create({
        data: { leadId: q.leadId, userId: user.id, type: "QUOTE", summary: `Quotation ${q.number} emailed to ${q.email}` },
      });
    }
    await audit({ userId: user.id, action: "SEND", entity: "Quotation", entityId: id, summary: `Sent quotation ${q.number} to ${q.email}` });
    refresh(id);
    revalidatePath("/admin/leads/", "page");
    return { ok: `Quotation emailed to ${q.email}.` };
  });
}

const DecisionSchema = z.enum(["ACCEPTED", "REJECTED", "EXPIRED", "DRAFT"]);

export async function setQuotationStatus(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("quote:manage", async (user) => {
    const id = str(fd, "id");
    const parsed = DecisionSchema.safeParse(str(fd, "status"));
    if (!parsed.success) return { error: "Unknown status." };
    const status = parsed.data;

    const q = await db.quotation.findUnique({ where: { id } });
    if (!q) return { error: "Quotation not found." };
    if (q.status === status) return { ok: "No change." };

    await db.quotation.update({
      where: { id },
      data: { status, respondedAt: status === "ACCEPTED" || status === "REJECTED" ? new Date() : null },
    });

    if (q.leadId && (status === "ACCEPTED" || status === "REJECTED")) {
      const lead = await db.lead.findUnique({ where: { id: q.leadId } });
      if (lead) {
        if (status === "ACCEPTED") {
          await db.lead.update({ where: { id: lead.id }, data: { status: "WON", wonValue: q.total, closedAt: new Date() } });
          await db.leadActivity.create({
            data: { leadId: lead.id, userId: user.id, type: "STATUS", summary: `Quotation ${q.number} accepted — lead marked Won` },
          });
        } else {
          await db.leadActivity.create({
            data: { leadId: lead.id, userId: user.id, type: "QUOTE", summary: `Quotation ${q.number} was rejected` },
          });
        }
      }
    }

    if (status === "ACCEPTED" || status === "REJECTED") {
      const siteUrl = process.env.SITE_URL ?? "https://triobuiltgulf.ae";
      await notifyAdmins({
        type: `quote.${status.toLowerCase()}`,
        title: `Quotation ${q.number} ${status.toLowerCase()}`,
        body: q.customerName,
        link: `/admin/quotations/${q.id}/`,
      });
      const [contact, crm] = await Promise.all([getContactSettingsFresh(), getCrmSettings()]);
      const mail = quotationDecisionEmail({ number: q.number, customer: q.customerName, status, adminUrl: `${siteUrl}/admin/quotations/${q.id}/` });
      await sendEmail({ to: crm.notifyEmails.length ? crm.notifyEmails : [contact.email], from: FROM.sales, ...mail });
    }

    await audit({ userId: user.id, action: "STATUS_CHANGE", entity: "Quotation", entityId: id, summary: `${q.number}: ${q.status} → ${status}` });
    refresh(id);
    revalidatePath("/admin/leads/", "page");
    return { ok: `Marked ${status.toLowerCase()}.` };
  });
}

/* --------------------------- duplicate / delete ------------------------ */

export async function duplicateQuotation(fd: FormData): Promise<void> {
  let newId = "";
  const res = await guarded("quote:manage", async (user) => {
    const src = await db.quotation.findUnique({ where: { id: str(fd, "id") }, include: { items: true } });
    if (!src) return;
    const copy = await db.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          number: `PENDING-${Date.now()}`,
          leadId: src.leadId,
          createdById: user.id,
          customerName: src.customerName,
          companyName: src.companyName,
          email: src.email,
          phone: src.phone,
          projectName: src.projectName,
          projectLocation: src.projectLocation,
          description: src.description,
          taxRate: src.taxRate,
          discount: src.discount,
          subtotal: src.subtotal,
          taxAmount: src.taxAmount,
          total: src.total,
          terms: src.terms,
          validUntil: null,
          items: {
            create: src.items.map((i) => ({
              position: i.position,
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
              lineTotal: i.lineTotal,
            })),
          },
        },
      });
      return tx.quotation.update({ where: { id: q.id }, data: { number: quoteNumber(new Date().getFullYear(), q.seq) } });
    });
    newId = copy.id;
    await audit({ userId: user.id, action: "CREATE", entity: "Quotation", entityId: copy.id, summary: `Duplicated ${src.number} as ${copy.number}` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
  redirect(newId ? `/admin/quotations/${newId}/` : "/admin/quotations/");
}

export async function deleteQuotation(fd: FormData): Promise<void> {
  const res = await guarded("quote:manage", async (user) => {
    const q = await db.quotation.findUnique({ where: { id: str(fd, "id") } });
    if (!q) return;
    if (q.status !== "DRAFT") throw new Error("Only drafts can be deleted.");
    await db.quotation.delete({ where: { id: q.id } });
    await audit({ userId: user.id, action: "DELETE", entity: "Quotation", entityId: q.id, summary: `Deleted draft ${q.number} (${q.customerName})` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
  redirect("/admin/quotations/");
}
