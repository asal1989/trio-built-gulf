import "server-only";
import { db } from "./db";

const DUBAI = "Asia/Dubai";

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;

/** Month label like "Oct 25". */
const monthLabel = (d: Date) => d.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: DUBAI });

export async function loadDashboard() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

  const [
    total,
    fresh,
    overdueFollowUps,
    quotationsSent,
    won,
    lost,
    activeProjects,
    completedProjects,
    publishedServices,
    maintenanceOpen,
    monthRows,
    serviceRows,
    typeRows,
    stageRows,
    activity,
    followUps,
  ] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { followUpAt: { lte: now }, status: { notIn: ["WON", "LOST"] } } }),
    db.quotation.count({ where: { status: "SENT" } }),
    db.lead.count({ where: { status: "WON" } }),
    db.lead.count({ where: { status: "LOST" } }),
    db.project.count({ where: { status: "ONGOING" } }),
    db.project.count({ where: { status: "COMPLETED" } }),
    db.service.count({ where: { published: true } }),
    db.lead.count({ where: { type: "MAINTENANCE", status: { notIn: ["WON", "LOST"] } } }),
    db.$queryRaw<{ m: Date; n: bigint }[]>`
      SELECT date_trunc('month', "createdAt" AT TIME ZONE 'Asia/Dubai') AS m, count(*)::bigint AS n
      FROM "Lead" WHERE "createdAt" >= ${monthStart} GROUP BY 1 ORDER BY 1`,
    db.lead.groupBy({ by: ["serviceLabel"], _count: { _all: true }, orderBy: { _count: { serviceLabel: "desc" } }, take: 8 }),
    db.lead.groupBy({ by: ["projectType"], _count: { _all: true }, orderBy: { _count: { projectType: "desc" } } }),
    db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    db.leadActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { lead: { select: { id: true, number: true, name: true } }, user: { select: { name: true } } },
    }),
    db.followUp.findMany({
      where: { completedAt: null },
      orderBy: { dueAt: "asc" },
      take: 8,
      include: { lead: { select: { id: true, number: true, name: true, status: true } }, assignedTo: { select: { name: true } } },
    }),
  ]);

  // Twelve month buckets, zero-filled.
  const buckets: { label: string; value: number }[] = [];
  const found = new Map(monthRows.map((r) => [new Date(r.m).toISOString().slice(0, 7), Number(r.n)]));
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + i, 1));
    buckets.push({ label: monthLabel(d), value: found.get(d.toISOString().slice(0, 7)) ?? 0 });
  }

  const stageCount = Object.fromEntries(stageRows.map((r) => [r.status, r._count._all])) as Record<string, number>;

  return {
    kpis: {
      total,
      fresh,
      overdueFollowUps,
      quotationsSent,
      won,
      lost,
      activeProjects,
      completedProjects,
      publishedServices,
      maintenanceOpen,
    },
    byMonth: buckets,
    byService: serviceRows.map((r) => ({ label: r.serviceLabel ?? "Not specified", value: r._count._all })),
    byType: typeRows.map((r) => ({ label: r.projectType ?? "Not specified", value: r._count._all })),
    stages: stageCount,
    activity,
    followUps,
    winRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null,
  };
}
