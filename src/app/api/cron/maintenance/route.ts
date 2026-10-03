import { timingSafeEqual } from "node:crypto";
import { db } from "@/server/db";
import { FROM, sendEmail } from "@/server/email/send";
import { followUpReminderEmail } from "@/server/email/templates";
import { notifyUsers } from "@/server/notifications";
import { purgeExpiredRateLimits } from "@/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled housekeeping — call this every 15–30 minutes (see docs/ADMIN.md):
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/maintenance/
 *
 *  - emails and notifies the owner of every follow-up that has fallen due
 *  - marks quotations past their validity date as expired
 *  - deletes expired sessions and rate-limit counters
 */
function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorised(req)) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const siteUrl = process.env.SITE_URL ?? "https://triobuiltgulf.ae";

  // 1. Follow-up reminders -------------------------------------------------
  const due = await db.followUp.findMany({
    where: { completedAt: null, reminderSentAt: null, dueAt: { lte: now }, lead: { status: { notIn: ["WON", "LOST"] } } },
    include: { lead: true, assignedTo: { select: { id: true, email: true, name: true } } },
    take: 100,
  });
  let reminders = 0;
  for (const f of due) {
    const link = `/admin/leads/${f.lead.id}/`;
    if (f.assignedTo) {
      await notifyUsers([f.assignedTo.id], { type: "followup.due", title: `Follow-up due: ${f.lead.name}`, body: f.note ?? undefined, link });
      const mail = followUpReminderEmail({
        leadNumber: f.lead.number,
        customer: f.lead.name,
        dueAt: f.dueAt.toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }),
        note: f.note,
        adminUrl: `${siteUrl}${link}`,
      });
      await sendEmail({ to: f.assignedTo.email, from: FROM.sales, ...mail });
    }
    await db.followUp.update({ where: { id: f.id }, data: { reminderSentAt: now } });
    reminders += 1;
  }

  // 2. Expire stale quotations ----------------------------------------------
  const expired = await db.quotation.updateMany({ where: { status: "SENT", validUntil: { lt: now } }, data: { status: "EXPIRED" } });

  // 3. Tidy up ---------------------------------------------------------------
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lt: now } } });
  await purgeExpiredRateLimits();

  return Response.json({ ok: true, reminders, expiredQuotations: expired.count, expiredSessions: sessions.count });
}
