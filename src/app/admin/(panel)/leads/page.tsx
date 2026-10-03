import Link from "next/link";
import LeadsBoard, { type BoardLead } from "@/components/admin/LeadsBoard";
import LeadsTable, { type TableLead } from "@/components/admin/LeadsTable";
import { button, EmptyState, inputCls, PageHeading, Pagination } from "@/components/admin/ui";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/enquiry-options";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { boardLeads, listLeads, staffForAssignment, type LeadFilters } from "@/server/leads/queries";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePage("lead:view");
  const sp = await searchParams;

  const filters: LeadFilters = {
    q: one(sp.q),
    status: one(sp.status),
    type: one(sp.type),
    assignee: one(sp.assignee),
    service: one(sp.service),
    from: one(sp.from),
    to: one(sp.to),
    followUp: one(sp.followUp),
    sort: one(sp.sort),
    dir: one(sp.dir),
    page: Number(one(sp.page) ?? 1) || 1,
  };
  const view = one(sp.view) === "board" ? "board" : "table";
  const canEdit = can(user, "lead:edit");

  const [staff, services] = await Promise.all([
    staffForAssignment(),
    db.service.findMany({ select: { id: true, label: true }, orderBy: { order: "asc" } }),
  ]);

  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val !== undefined && val !== "") p.set(k, String(val));
    }
    const s = p.toString();
    return `/admin/leads/${s ? `?${s}` : ""}`;
  };

  let body: React.ReactNode;
  let total = 0;

  if (view === "board") {
    const { columns, totals } = await boardLeads(filters);
    total = Object.values(totals).reduce((a, b) => a + b, 0);
    const leads: BoardLead[] = Object.values(columns)
      .flat()
      .map((l) => ({
        id: l.id,
        number: l.number,
        name: l.name,
        company: l.company,
        serviceLabel: l.serviceLabel,
        location: l.location,
        phone: l.phone,
        whatsapp: l.whatsapp,
        followUpAt: l.followUpAt?.toISOString() ?? null,
        createdAt: l.createdAt.toISOString(),
        assignedTo: l.assignedTo?.name ?? null,
        status: l.status,
      }));
    body = total === 0 ? <EmptyState title="No leads match" text="Try clearing the filters." /> : <LeadsBoard leads={leads} totals={totals} canEdit={canEdit} />;
  } else {
    const result = await listLeads(filters);
    total = result.total;
    const rows: TableLead[] = result.rows.map((l) => ({
      id: l.id,
      number: l.number,
      name: l.name,
      company: l.company,
      email: l.email,
      phone: l.phone,
      serviceLabel: l.serviceLabel,
      location: l.location,
      status: l.status,
      type: l.type,
      assignedTo: l.assignedTo?.name ?? null,
      followUpAt: l.followUpAt?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
      attachments: l._count.attachments,
    }));
    const sort = filters.sort ?? "createdAt";
    const dir = filters.dir === "asc" ? "asc" : "desc";
    body =
      rows.length === 0 ? (
        <EmptyState
          title="No leads found"
          text="Website enquiries appear here automatically. You can also add a lead by hand."
          action={
            canEdit ? (
              <Link href="/admin/leads/new/" className={button("teal")}>
                Add a lead
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <LeadsTable
            leads={rows}
            staff={staff}
            canEdit={canEdit}
            canAssign={can(user, "lead:assign")}
            canDelete={can(user, "lead:delete")}
            sort={sort}
            dir={dir}
            sortLinks={Object.fromEntries(
              ["number", "name", "status", "followUpAt", "createdAt"].map((field) => [
                field,
                qs({ sort: field, dir: sort === field && dir === "asc" ? "desc" : "asc", page: 1 }),
              ]),
            )}
          />
          <Pagination page={result.page} pages={result.pages} hrefFor={(p) => qs({ page: p })} />
        </>
      );
  }

  return (
    <>
      <PageHeading
        title="Leads"
        subtitle={`${total} ${total === 1 ? "enquiry" : "enquiries"}${filters.q || filters.status ? " match your filters" : ""}`}
        actions={
          <>
            <div className="flex rounded-lg border border-line bg-white p-0.5 text-sm" role="group" aria-label="View">
              <Link href={qs({ view: "table", page: 1 })} aria-current={view === "table"} className={`rounded-md px-3 py-1.5 font-semibold ${view === "table" ? "bg-navy text-white" : "text-navy/70 hover:bg-mist"}`}>
                Table
              </Link>
              <Link href={qs({ view: "board" })} aria-current={view === "board"} className={`rounded-md px-3 py-1.5 font-semibold ${view === "board" ? "bg-navy text-white" : "text-navy/70 hover:bg-mist"}`}>
                Pipeline
              </Link>
            </div>
            {canEdit ? (
              <Link href="/admin/leads/new/" className={button("teal")}>
                + New lead
              </Link>
            ) : null}
          </>
        }
      />

      <form method="get" className="mb-5 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-2 lg:grid-cols-6">
        <input type="hidden" name="view" value={view} />
        <input name="q" defaultValue={filters.q ?? ""} placeholder="Search name, company, phone, L-000123…" aria-label="Search leads" className={`${inputCls} lg:col-span-2`} />
        <select name="status" defaultValue={filters.status ?? ""} aria-label="Status" className={inputCls} disabled={view === "board"}>
          <option value="">All statuses</option>
          {LEAD_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select name="assignee" defaultValue={filters.assignee ?? ""} aria-label="Assigned to" className={inputCls}>
          <option value="">Anyone</option>
          <option value="none">Unassigned</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select name="service" defaultValue={filters.service ?? ""} aria-label="Service" className={inputCls}>
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={filters.type ?? ""} aria-label="Type" className={inputCls}>
          <option value="">All types</option>
          <option value="QUOTE">Quote requests</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="GENERAL">General</option>
        </select>
        <input type="date" name="from" defaultValue={filters.from ?? ""} aria-label="From date" className={inputCls} />
        <input type="date" name="to" defaultValue={filters.to ?? ""} aria-label="To date" className={inputCls} />
        <select name="followUp" defaultValue={filters.followUp ?? ""} aria-label="Follow-up" className={inputCls}>
          <option value="">Any follow-up</option>
          <option value="due">Has follow-up scheduled</option>
          <option value="overdue">Follow-up overdue</option>
        </select>
        <div className="flex gap-2 lg:col-span-3 lg:justify-end">
          <button type="submit" className={button("primary")}>
            Apply filters
          </button>
          <Link href={`/admin/leads/?view=${view}`} className={button("secondary")}>
            Reset
          </Link>
        </div>
      </form>

      {body}
    </>
  );
}
