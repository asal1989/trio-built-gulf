import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { staffForAssignment } from "@/server/leads/queries";
import { nowMs } from "@/lib/time";
import { ConfirmForm } from "@/components/admin/forms";
import { deleteLead } from "../actions";
import {
  AssignForm,
  CompleteFollowUp,
  ContactActions,
  EditLeadModal,
  FollowUpForm,
  NoteForm,
  StatusForm,
} from "@/components/admin/LeadPanels";
import { leadCode, StatusBadge, TYPE_LABEL } from "@/components/admin/lead-ui";
import { Badge, button, Card, formatDate, formatMoney, PageHeading } from "@/components/admin/ui";

const ACTIVITY_ICON: Record<string, string> = {
  CREATED: "🆕",
  STATUS: "🔀",
  ASSIGNED: "👤",
  NOTE: "📝",
  FOLLOW_UP: "⏰",
  CALL: "📞",
  EMAIL: "✉️",
  WHATSAPP: "💬",
  QUOTE: "🧾",
  ATTACHMENT: "📎",
  UPDATED: "✏️",
};

const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function LeadProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePage("lead:view");
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      attachments: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      activities: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } }, take: 100 },
      followUps: { orderBy: { dueAt: "asc" } },
      quotations: { orderBy: { createdAt: "desc" }, select: { id: true, number: true, status: true, total: true, currency: true, createdAt: true } },
    },
  });
  if (!lead) notFound();

  const [staff, services] = await Promise.all([
    staffForAssignment(),
    db.service.findMany({ where: { published: true }, select: { label: true }, orderBy: { order: "asc" } }),
  ]);

  const canEdit = can(user, "lead:edit");
  const open = lead.followUps.filter((f) => !f.completedAt);
  const done = lead.followUps.filter((f) => f.completedAt);
  const now = nowMs();

  const detail = (label: string, value: React.ReactNode) =>
    value ? (
      <div className="grid grid-cols-3 gap-3 border-b border-line/60 py-2.5 text-sm last:border-0">
        <dt className="text-navy/55">{label}</dt>
        <dd className="col-span-2 break-words font-medium text-navy">{value}</dd>
      </div>
    ) : null;

  return (
    <>
      <Link href="/admin/leads/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All leads
      </Link>
      <PageHeading
        title={lead.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-navy">{leadCode(lead.number)}</span>
            <StatusBadge status={lead.status} />
            {lead.type !== "QUOTE" ? <Badge tone="orange">{TYPE_LABEL[lead.type]}</Badge> : null}
            <span>Received {formatDate(lead.createdAt, true)}</span>
            <span className="text-navy/40">· via {lead.source}</span>
          </span>
        }
        actions={
          <>
            {can(user, "quote:manage") ? (
              <Link href={`/admin/quotations/new/?leadId=${lead.id}`} className={button("gold")}>
                🧾 Create quotation
              </Link>
            ) : null}
            {canEdit ? <EditLeadModal services={services.map((s) => s.label)} lead={{ ...lead, expectedStart: lead.expectedStart?.toISOString().slice(0, 10) ?? null }} /> : null}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <Card title="Contact">
            <ContactActions id={lead.id} name={lead.name} phone={lead.phone} whatsapp={lead.whatsapp} email={lead.email} canLog={canEdit} />
            <dl className="mt-4">
              {detail("Company", lead.company)}
              {detail("Phone", lead.phone)}
              {detail("WhatsApp", lead.whatsapp)}
              {detail("Email", lead.email ? <a className="text-teal-700 hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a> : null)}
            </dl>
          </Card>

          <Card title="Project">
            <dl>
              {detail("Service", lead.serviceLabel)}
              {detail("Project type", lead.projectType)}
              {detail("Location", lead.location)}
              {detail("Approx. area", lead.area)}
              {detail("Expected start", lead.expectedStart ? formatDate(lead.expectedStart) : null)}
              {detail("Budget", lead.budget)}
              {lead.status === "WON" && lead.wonValue ? detail("Won value", formatMoney(lead.wonValue)) : null}
              {lead.status === "LOST" && lead.lostReason ? detail("Reason lost", lead.lostReason) : null}
            </dl>
            {lead.message ? (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-navy/55">Customer message</h3>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border-l-[3px] border-gold bg-mist px-4 py-3 text-sm text-navy">{lead.message}</p>
              </div>
            ) : null}
          </Card>

          <Card title={`Attachments (${lead.attachments.length})`}>
            {lead.attachments.length === 0 ? (
              <p className="text-sm text-navy/55">No files were uploaded with this enquiry.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {lead.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate">
                      📎 <span className="font-medium text-navy">{a.fileName}</span> <span className="text-navy/50">({size(a.size)})</span>
                    </span>
                    <a href={`/api/admin/attachments/${a.id}/`} className={button("secondary", true)}>
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-navy/45">Files are private. Each download uses a link that expires in 5 minutes.</p>
          </Card>

          {lead.quotations.length > 0 ? (
            <Card title="Quotations">
              <ul className="divide-y divide-line/70">
                {lead.quotations.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <Link href={`/admin/quotations/${q.id}/`} className="font-semibold text-teal-700 hover:underline">
                      {q.number}
                    </Link>
                    <span className="text-navy/60">{formatMoney(q.total, q.currency)}</span>
                    <Badge tone={q.status === "ACCEPTED" ? "green" : q.status === "REJECTED" || q.status === "EXPIRED" ? "red" : q.status === "SENT" ? "gold" : "neutral"}>
                      {q.status.charAt(0) + q.status.slice(1).toLowerCase()}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card title="Internal notes">
            {can(user, "lead:note") ? <NoteForm id={lead.id} /> : null}
            {lead.notes.length === 0 ? (
              <p className="mt-3 text-sm text-navy/55">No notes yet.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {lead.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-line bg-mist/60 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm text-navy">{n.body}</p>
                    <p className="mt-1.5 text-xs text-navy/50">
                      {n.author?.name ?? "Someone"} · {formatDate(n.createdAt, true)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Activity history">
            <ol className="relative space-y-4 border-l border-line pl-5">
              {lead.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span aria-hidden="true" className="absolute -left-[1.85rem] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-xs">
                    {ACTIVITY_ICON[a.type] ?? "•"}
                  </span>
                  <p className="text-sm text-navy">{a.summary}</p>
                  <p className="text-xs text-navy/50">
                    {a.user?.name ?? "System"} · {formatDate(a.createdAt, true)}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Pipeline">
            <StatusForm id={lead.id} status={lead.status} canEdit={canEdit} />
            {!canEdit ? <StatusBadge status={lead.status} /> : null}
          </Card>

          <Card title="Owner">
            <AssignForm id={lead.id} assigneeId={lead.assignedToId} staff={staff.map((s) => ({ id: s.id, name: s.name }))} canAssign={can(user, "lead:assign")} />
          </Card>

          <Card title="Follow-ups">
            {open.length > 0 ? (
              <ul className="mb-4 space-y-2">
                {open.map((f) => (
                  <li key={f.id} className="rounded-lg border border-line px-3 py-2.5 text-sm">
                    <p className={`font-semibold ${f.dueAt.getTime() < now ? "text-red-600" : "text-navy"}`}>
                      {formatDate(f.dueAt, true)}
                      {f.dueAt.getTime() < now ? " · overdue" : ""}
                    </p>
                    {f.note ? <p className="text-xs text-navy/60">{f.note}</p> : null}
                    {can(user, "lead:followup") ? (
                      <div className="mt-1">
                        <CompleteFollowUp followUpId={f.id} />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-navy/55">Nothing scheduled.</p>
            )}
            {can(user, "lead:followup") ? <FollowUpForm id={lead.id} /> : null}
            {done.length > 0 ? <p className="mt-3 text-xs text-navy/45">{done.length} completed</p> : null}
          </Card>

          {can(user, "lead:delete") ? (
            <Card title="Danger zone">
              <ConfirmForm
                action={deleteLead}
                hidden={{ id: lead.id }}
                title="Delete this lead?"
                message="This permanently removes the lead, its notes, activity and uploaded files. Linked quotations are kept."
                confirmLabel="Delete lead"
              >
                Delete lead
              </ConfirmForm>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
