import Link from "next/link";
import { StatusBadge, leadCode } from "@/components/admin/lead-ui";
import { Card, DataTable, EmptyState, formatDate, PageHeading, StatCard, td, th, button } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";

export default async function MaintenancePage() {
  const user = await requirePage("lead:view");
  const where = { type: "MAINTENANCE" as const };
  const [open, total, rows] = await Promise.all([
    db.lead.count({ where: { ...where, status: { notIn: ["WON", "LOST"] } } }),
    db.lead.count({ where }),
    db.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 30, include: { assignedTo: { select: { name: true } } } }),
  ]);

  return (
    <>
      <PageHeading
        title="Maintenance & AMC"
        subtitle="Maintenance requests and annual maintenance contract enquiries."
        actions={
          can(user, "content:manage") ? (
            <Link href="/admin/content/?tab=maintenance-amc" className={button("secondary")}>
              Edit the Maintenance page content
            </Link>
          ) : undefined
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Open requests" value={open} tone="gold" href="/admin/leads/?type=MAINTENANCE" />
        <StatCard label="All maintenance enquiries" value={total} href="/admin/leads/?type=MAINTENANCE" />
        <StatCard label="Quotations sent (AMC)" value="—" hint="See Quotations" href="/admin/quotations/" />
      </div>
      <Card title="Latest requests" padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No maintenance requests yet" text="Enquiries marked as Maintenance / AMC on the website form appear here automatically." />
          </div>
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th className={th}>Lead</th>
                <th className={th}>Customer</th>
                <th className={th}>Service</th>
                <th className={th}>Status</th>
                <th className={th}>Assigned</th>
                <th className={th}>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-mist/50">
                  <td className={td}>
                    <Link href={`/admin/leads/${l.id}/`} className="font-semibold text-teal-700 hover:underline">
                      {leadCode(l.number)}
                    </Link>
                  </td>
                  <td className={td}>
                    {l.name}
                    <div className="text-xs text-navy/55">{l.company ?? l.phone}</div>
                  </td>
                  <td className={td}>{l.serviceLabel ?? "—"}</td>
                  <td className={td}>
                    <StatusBadge status={l.status} />
                  </td>
                  <td className={td}>{l.assignedTo?.name ?? "—"}</td>
                  <td className={td}>{formatDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>
    </>
  );
}
