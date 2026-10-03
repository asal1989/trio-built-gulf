import Link from "next/link";
import { BarChart, Donut, Funnel, HBarChart } from "@/components/admin/charts";
import { leadCode } from "@/components/admin/lead-ui";
import { Card, formatDate, PageHeading, StatCard } from "@/components/admin/ui";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/enquiry-options";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { loadDashboard } from "@/server/dashboard";
import { nowMs } from "@/lib/time";

const STAGE_TONE: Record<string, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#8b5cf6",
  SITE_VISIT: "#f97316",
  QUOTATION_SENT: "#e0b04a",
  NEGOTIATION: "#348171",
  WON: "#059669",
  LOST: "#dc2626",
};

export default async function DashboardPage() {
  const user = await requirePage("dashboard:view");
  const d = await loadDashboard();
  const showLeads = can(user, "lead:view");
  const k = d.kpis;
  const hour = new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dubai" });
  const greeting = Number(hour) < 12 ? "Good morning" : Number(hour) < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeading
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        subtitle="Here is what is happening with Trio Built Gulf today."
        actions={
          showLeads ? (
            <Link href="/admin/leads/?view=board" className="inline-flex items-center rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-900">
              Open pipeline
            </Link>
          ) : undefined
        }
      />

      <section aria-label="Key figures" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total enquiries" value={k.total} href={showLeads ? "/admin/leads/" : undefined} />
        <StatCard label="New enquiries" value={k.fresh} tone="teal" hint="Awaiting first contact" href={showLeads ? "/admin/leads/?status=NEW" : undefined} />
        <StatCard label="Follow-ups due" value={k.overdueFollowUps} tone={k.overdueFollowUps > 0 ? "red" : "navy"} hint="Due or overdue" href={showLeads ? "/admin/leads/?followUp=overdue" : undefined} />
        <StatCard label="Quotations sent" value={k.quotationsSent} tone="gold" hint="Awaiting a decision" href="/admin/quotations/?status=SENT" />
        <StatCard label="Maintenance requests" value={k.maintenanceOpen} hint="Open" href={showLeads ? "/admin/leads/?type=MAINTENANCE" : undefined} />
        <StatCard label="Won" value={k.won} tone="teal" hint={d.winRate !== null ? `${d.winRate}% win rate` : undefined} href={showLeads ? "/admin/leads/?status=WON" : undefined} />
        <StatCard label="Lost" value={k.lost} tone="red" href={showLeads ? "/admin/leads/?status=LOST" : undefined} />
        <StatCard label="Active projects" value={k.activeProjects} href="/admin/projects/?status=ONGOING" />
        <StatCard label="Completed projects" value={k.completedProjects} href="/admin/projects/?status=COMPLETED" />
        <StatCard label="Published services" value={k.publishedServices} href="/admin/services/" />
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card title="Enquiries by month" className="xl:col-span-2">
          <BarChart data={d.byMonth} />
        </Card>
        <Card title="Pipeline conversion">
          <Funnel stages={LEAD_STATUS_ORDER.filter((s) => s !== "LOST").map((s) => ({ label: LEAD_STATUS_LABELS[s], value: d.stages[s] ?? 0, tone: STAGE_TONE[s] }))} />
          <p className="mt-3 text-xs text-navy/50">Percentages are relative to new enquiries. {k.lost} lost.</p>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Enquiries by service">
          <HBarChart data={d.byService} empty="Enquiries will be grouped by service here." />
        </Card>
        <Card title="Enquiries by project type">
          <Donut data={d.byType} empty="Enquiries will be grouped by project type here." />
        </Card>
      </div>

      {showLeads ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="Upcoming follow-ups" actions={<Link href="/admin/leads/?followUp=due" className="text-xs font-semibold text-teal-700 hover:underline">View all</Link>}>
            {d.followUps.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy/50">No follow-ups scheduled.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {d.followUps.map((f) => {
                  const overdue = f.dueAt.getTime() < nowMs();
                  return (
                    <li key={f.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <Link href={`/admin/leads/${f.lead.id}/`} className="font-semibold text-navy hover:text-teal-700">
                          {f.lead.name} <span className="font-normal text-navy/45">{leadCode(f.lead.number)}</span>
                        </Link>
                        {f.note ? <p className="truncate text-xs text-navy/55">{f.note}</p> : null}
                        <p className="text-xs text-navy/45">{f.assignedTo?.name ?? "Unassigned"}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold ${overdue ? "text-red-600" : "text-navy/70"}`}>
                        {formatDate(f.dueAt, true)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Recent activity">
            {d.activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy/50">Activity will appear here.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {d.activity.map((a) => (
                  <li key={a.id} className="py-3 text-sm">
                    <p className="text-navy">{a.summary}</p>
                    <p className="text-xs text-navy/50">
                      <Link href={`/admin/leads/${a.lead.id}/`} className="font-medium text-teal-700 hover:underline">
                        {a.lead.name} ({leadCode(a.lead.number)})
                      </Link>{" "}
                      · {a.user?.name ?? "System"} · {formatDate(a.createdAt, true)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
