"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS } from "@/lib/enquiry-options";
import { audit } from "@/server/audit";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { guarded, fieldErrorsFrom, str, type ActionResult } from "@/server/action-helpers";
import { leadCode } from "@/server/email/templates";
import { notifyUsers } from "@/server/notifications";

const refresh = (id?: string) => {
  revalidatePath("/admin/leads/", "page");
  if (id) revalidatePath(`/admin/leads/${id}/`);
  revalidatePath("/admin/");
};

const idSchema = z.string().min(1).max(60);

/* ----------------------------- status ---------------------------------- */

const StatusSchema = z.object({
  id: idSchema,
  status: z.nativeEnum(LeadStatus),
  lostReason: z.string().trim().max(300).optional(),
  wonValue: z.string().trim().optional(),
});

export async function setLeadStatus(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:edit", async (user) => {
    const parsed = StatusSchema.safeParse({
      id: str(fd, "id"),
      status: str(fd, "status"),
      lostReason: str(fd, "lostReason") || undefined,
      wonValue: str(fd, "wonValue") || undefined,
    });
    if (!parsed.success) return { error: "Invalid status." };
    const { id, status, lostReason, wonValue } = parsed.data;

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { error: "Lead not found." };
    if (lead.status === status && !lostReason && !wonValue) return { ok: "Status unchanged." };

    const value = wonValue ? Number(wonValue.replace(/,/g, "")) : undefined;
    if (wonValue && (!Number.isFinite(value) || (value ?? 0) < 0)) return { error: "Enter a valid won value." };

    const closing = status === "WON" || status === "LOST";
    await db.lead.update({
      where: { id },
      data: {
        status,
        closedAt: closing ? new Date() : null,
        lostReason: status === "LOST" ? (lostReason ?? lead.lostReason) : null,
        wonValue: status === "WON" ? (value ?? lead.wonValue) : null,
      },
    });
    await db.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: "STATUS",
        summary: `Status changed from ${LEAD_STATUS_LABELS[lead.status]} to ${LEAD_STATUS_LABELS[status]}`,
        data: { from: lead.status, to: status, lostReason, wonValue },
      },
    });
    await audit({
      userId: user.id,
      action: "STATUS_CHANGE",
      entity: "Lead",
      entityId: id,
      summary: `${leadCode(lead.number)}: ${LEAD_STATUS_LABELS[lead.status]} → ${LEAD_STATUS_LABELS[status]}`,
    });
    refresh(id);
    return { ok: `Moved to ${LEAD_STATUS_LABELS[status]}.` };
  });
}

/* ---------------------------- assignment ------------------------------- */

export async function assignLead(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:assign", async (user) => {
    const id = str(fd, "id");
    const assigneeId = str(fd, "assigneeId");
    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { error: "Lead not found." };

    let assignee: { id: string; name: string } | null = null;
    if (assigneeId) {
      assignee = await db.user.findFirst({ where: { id: assigneeId, active: true }, select: { id: true, name: true } });
      if (!assignee) return { error: "That user is not available." };
    }

    await db.lead.update({ where: { id }, data: { assignedToId: assignee?.id ?? null } });
    await db.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: "ASSIGNED",
        summary: assignee ? `Assigned to ${assignee.name}` : "Unassigned",
      },
    });
    await audit({ userId: user.id, action: "UPDATE", entity: "Lead", entityId: id, summary: `${leadCode(lead.number)} assigned to ${assignee?.name ?? "nobody"}` });
    if (assignee && assignee.id !== user.id) {
      await notifyUsers([assignee.id], {
        type: "lead.assigned",
        title: `Enquiry ${leadCode(lead.number)} assigned to you`,
        body: lead.name,
        link: `/admin/leads/${id}/`,
      });
    }
    refresh(id);
    return { ok: assignee ? `Assigned to ${assignee.name}.` : "Unassigned." };
  });
}

/* ------------------------------ notes ---------------------------------- */

export async function addNote(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:note", async (user) => {
    const id = str(fd, "id");
    const body = str(fd, "body");
    if (body.length < 1) return { error: "Write a note first." };
    if (body.length > 4000) return { error: "That note is too long." };
    const lead = await db.lead.findUnique({ where: { id }, select: { id: true, number: true } });
    if (!lead) return { error: "Lead not found." };

    await db.leadNote.create({ data: { leadId: id, authorId: user.id, body } });
    await db.leadActivity.create({ data: { leadId: id, userId: user.id, type: "NOTE", summary: "Added an internal note" } });
    refresh(id);
    return { ok: "Note added." };
  });
}

/* ---------------------------- follow-ups ------------------------------- */

const FollowUpSchema = z.object({
  id: idSchema,
  dueAt: z.string().min(1, "Choose a date and time."),
  note: z.string().trim().max(500).optional(),
});

export async function scheduleFollowUp(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:followup", async (user) => {
    const parsed = FollowUpSchema.safeParse({ id: str(fd, "id"), dueAt: str(fd, "dueAt"), note: str(fd, "note") || undefined });
    if (!parsed.success) return { error: "Choose a date and time.", fieldErrors: fieldErrorsFrom(parsed.error) };

    // The input is a Dubai local time (UTC+4, no DST).
    const dueAt = new Date(`${parsed.data.dueAt}:00+04:00`);
    if (Number.isNaN(dueAt.getTime())) return { error: "That date is not valid." };

    const lead = await db.lead.findUnique({ where: { id: parsed.data.id } });
    if (!lead) return { error: "Lead not found." };

    await db.$transaction([
      db.followUp.create({
        data: { leadId: lead.id, assignedToId: lead.assignedToId ?? user.id, dueAt, note: parsed.data.note },
      }),
      db.lead.update({ where: { id: lead.id }, data: { followUpAt: dueAt } }),
      db.leadActivity.create({
        data: {
          leadId: lead.id,
          userId: user.id,
          type: "FOLLOW_UP",
          summary: `Follow-up scheduled for ${dueAt.toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" })}`,
          data: { note: parsed.data.note ?? null },
        },
      }),
    ]);
    refresh(lead.id);
    return { ok: "Follow-up scheduled." };
  });
}

export async function completeFollowUp(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:followup", async (user) => {
    const followUpId = str(fd, "followUpId");
    const fu = await db.followUp.findUnique({ where: { id: followUpId } });
    if (!fu) return { error: "Follow-up not found." };

    await db.followUp.update({ where: { id: fu.id }, data: { completedAt: new Date() } });
    // The lead's headline follow-up date becomes the next open one (if any).
    const next = await db.followUp.findFirst({
      where: { leadId: fu.leadId, completedAt: null },
      orderBy: { dueAt: "asc" },
    });
    await db.lead.update({ where: { id: fu.leadId }, data: { followUpAt: next?.dueAt ?? null } });
    await db.leadActivity.create({
      data: { leadId: fu.leadId, userId: user.id, type: "FOLLOW_UP", summary: "Follow-up marked done" },
    });
    refresh(fu.leadId);
    return { ok: "Follow-up completed." };
  });
}

/* ---------------------- contact logging (call/email/wa) ---------------- */

export async function logContact(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:edit", async (user) => {
    const id = str(fd, "id");
    const channel = str(fd, "channel");
    if (!["CALL", "EMAIL", "WHATSAPP"].includes(channel)) return { error: "Unknown channel." };
    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { error: "Lead not found." };

    const label = { CALL: "Phone call", EMAIL: "Email", WHATSAPP: "WhatsApp message" }[channel as "CALL" | "EMAIL" | "WHATSAPP"];
    await db.leadActivity.create({
      data: { leadId: id, userId: user.id, type: channel, summary: `${label} to the customer` },
    });
    // First contact moves a brand-new lead on automatically.
    if (lead.status === "NEW") {
      await db.lead.update({ where: { id }, data: { status: "CONTACTED" } });
      await db.leadActivity.create({
        data: { leadId: id, userId: user.id, type: "STATUS", summary: "Status changed from New to Contacted" },
      });
    }
    refresh(id);
    return { ok: `${label} logged.` };
  });
}

/* ------------------------- details / create ---------------------------- */

const DetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer name.").max(100),
  company: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Enter a valid email.").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  serviceLabel: z.string().trim().max(160).optional(),
  projectType: z.string().trim().max(80).optional(),
  location: z.string().trim().max(160).optional(),
  area: z.string().trim().max(60).optional(),
  expectedStart: z.string().trim().optional(),
  budget: z.string().trim().max(80).optional(),
  message: z.string().trim().max(4000).optional(),
  type: z.nativeEnum(LeadType).default("QUOTE"),
});

function detailsFromForm(fd: FormData) {
  const get = (k: string) => str(fd, k) || undefined;
  return DetailsSchema.safeParse({
    name: str(fd, "name"),
    company: get("company"),
    email: str(fd, "email"),
    phone: get("phone"),
    whatsapp: get("whatsapp"),
    serviceLabel: get("serviceLabel"),
    projectType: get("projectType"),
    location: get("location"),
    area: get("area"),
    expectedStart: get("expectedStart"),
    budget: get("budget"),
    message: get("message"),
    type: str(fd, "type") || "QUOTE",
  });
}

export async function updateLeadDetails(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:edit", async (user) => {
    const id = str(fd, "id");
    const parsed = detailsFromForm(fd);
    if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;

    const service = d.serviceLabel
      ? await db.service.findFirst({ where: { OR: [{ name: d.serviceLabel }, { label: d.serviceLabel }] }, select: { id: true } })
      : null;

    const lead = await db.lead.update({
      where: { id },
      data: {
        name: d.name,
        company: d.company ?? null,
        email: d.email || null,
        phone: d.phone ?? null,
        whatsapp: d.whatsapp ?? null,
        serviceLabel: d.serviceLabel ?? null,
        serviceId: service?.id ?? null,
        projectType: d.projectType ?? null,
        location: d.location ?? null,
        area: d.area ?? null,
        expectedStart: d.expectedStart ? new Date(`${d.expectedStart}T00:00:00Z`) : null,
        budget: d.budget ?? null,
        message: d.message ?? null,
        type: d.type,
      },
    });
    await db.leadActivity.create({ data: { leadId: id, userId: user.id, type: "UPDATED", summary: "Lead details edited" } });
    await audit({ userId: user.id, action: "UPDATE", entity: "Lead", entityId: id, summary: `Edited ${leadCode(lead.number)}` });
    refresh(id);
    return { ok: "Lead updated." };
  });
}

export async function createLeadManually(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:edit", async (user) => {
    const parsed = detailsFromForm(fd);
    if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;
    const source = str(fd, "source") || "manual";

    const service = d.serviceLabel
      ? await db.service.findFirst({ where: { OR: [{ name: d.serviceLabel }, { label: d.serviceLabel }] }, select: { id: true } })
      : null;

    const lead = await db.lead.create({
      data: {
        name: d.name,
        company: d.company,
        email: d.email || undefined,
        phone: d.phone,
        whatsapp: d.whatsapp,
        serviceLabel: d.serviceLabel,
        serviceId: service?.id,
        projectType: d.projectType,
        location: d.location,
        area: d.area,
        expectedStart: d.expectedStart ? new Date(`${d.expectedStart}T00:00:00Z`) : undefined,
        budget: d.budget,
        message: d.message,
        type: d.type,
        source,
        assignedToId: user.id,
        activities: { create: { userId: user.id, type: "CREATED", summary: `Lead created manually (${source})` } },
      },
    });
    await audit({ userId: user.id, action: "CREATE", entity: "Lead", entityId: lead.id, summary: `Created ${leadCode(lead.number)} (${lead.name})` });
    refresh(lead.id);
    return { ok: "Lead created.", id: lead.id };
  });
}

/* ------------------------------ delete / bulk -------------------------- */

export async function deleteLead(fd: FormData): Promise<void> {
  const res = await guarded("lead:delete", async (user) => {
    const id = str(fd, "id");
    const lead = await db.lead.findUnique({ where: { id }, include: { attachments: true } });
    if (!lead) return;
    const { storage } = await import("@/server/storage");
    for (const a of lead.attachments) await storage().delete(a.storageKey).catch(() => {});
    await db.lead.delete({ where: { id } });
    await audit({ userId: user.id, action: "DELETE", entity: "Lead", entityId: id, summary: `Deleted ${leadCode(lead.number)} (${lead.name})` });
  });
  if (res.error) throw new Error(res.error);
  refresh();
  const { redirect } = await import("next/navigation");
  redirect("/admin/leads/");
}

const BulkSchema = z.object({
  ids: z.array(idSchema).min(1, "Select at least one lead.").max(200),
  action: z.enum(["status", "assign", "delete"]),
});

export async function bulkLeadAction(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("lead:edit", async (user) => {
    const parsed = BulkSchema.safeParse({ ids: fd.getAll("ids").map(String), action: str(fd, "bulk") });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Choose leads and an action." };
    const { ids, action } = parsed.data;

    if (action === "delete") {
      if (!can(user, "lead:delete")) return { error: "You cannot delete leads." };
      const { storage } = await import("@/server/storage");
      const leads = await db.lead.findMany({ where: { id: { in: ids } }, include: { attachments: true } });
      for (const l of leads) for (const a of l.attachments) await storage().delete(a.storageKey).catch(() => {});
      await db.lead.deleteMany({ where: { id: { in: ids } } });
      await audit({ userId: user.id, action: "DELETE", entity: "Lead", summary: `Bulk-deleted ${leads.length} lead(s)` });
      refresh();
      return { ok: `${leads.length} lead(s) deleted.` };
    }

    if (action === "assign") {
      if (!can(user, "lead:assign")) return { error: "You cannot assign leads." };
      const assigneeId = str(fd, "assigneeId");
      await db.lead.updateMany({ where: { id: { in: ids } }, data: { assignedToId: assigneeId || null } });
      await audit({ userId: user.id, action: "UPDATE", entity: "Lead", summary: `Bulk-assigned ${ids.length} lead(s)` });
      refresh();
      return { ok: `${ids.length} lead(s) updated.` };
    }

    const status = z.nativeEnum(LeadStatus).safeParse(str(fd, "status"));
    if (!status.success) return { error: "Choose a status." };
    const closing = status.data === "WON" || status.data === "LOST";
    await db.lead.updateMany({
      where: { id: { in: ids } },
      data: { status: status.data, closedAt: closing ? new Date() : null },
    });
    await db.leadActivity.createMany({
      data: ids.map((leadId) => ({ leadId, userId: user.id, type: "STATUS", summary: `Status set to ${LEAD_STATUS_LABELS[status.data]} (bulk)` })),
    });
    await audit({ userId: user.id, action: "STATUS_CHANGE", entity: "Lead", summary: `Bulk status → ${LEAD_STATUS_LABELS[status.data]} for ${ids.length} lead(s)` });
    refresh();
    return { ok: `${ids.length} lead(s) moved to ${LEAD_STATUS_LABELS[status.data]}.` };
  });
}

/** Used by the Kanban board: a single drag-and-drop move. */
export async function moveLead(id: string, status: LeadStatus): Promise<ActionResult> {
  const fd = new FormData();
  fd.set("id", id);
  fd.set("status", status);
  return setLeadStatus(undefined, fd);
}
