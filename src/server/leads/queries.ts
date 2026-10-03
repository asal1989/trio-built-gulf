import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { db } from "../db";

export type LeadFilters = {
  q?: string;
  status?: string;
  type?: string;
  assignee?: string; // user id | "none"
  service?: string;
  from?: string; // yyyy-mm-dd
  to?: string;
  followUp?: string; // "due" | "overdue" | "any"
  sort?: string;
  dir?: string;
  page?: number;
  perPage?: number;
};

const SORTABLE = new Set(["createdAt", "number", "name", "status", "followUpAt", "updatedAt"]);

export function buildLeadWhere(f: LeadFilters): Prisma.LeadWhereInput {
  const and: Prisma.LeadWhereInput[] = [];

  const q = f.q?.trim();
  if (q) {
    const num = Number(q.replace(/^l-?/i, ""));
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { whatsapp: { contains: q } },
        { serviceLabel: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        ...(Number.isInteger(num) && num > 0 ? [{ number: num }] : []),
      ],
    });
  }
  if (f.status && f.status in LeadStatus) and.push({ status: f.status as LeadStatus });
  if (f.type && f.type in LeadType) and.push({ type: f.type as LeadType });
  if (f.assignee === "none") and.push({ assignedToId: null });
  else if (f.assignee) and.push({ assignedToId: f.assignee });
  if (f.service) and.push({ OR: [{ serviceId: f.service }, { serviceLabel: f.service }] });
  if (f.from) and.push({ createdAt: { gte: new Date(`${f.from}T00:00:00+04:00`) } });
  if (f.to) and.push({ createdAt: { lte: new Date(`${f.to}T23:59:59+04:00`) } });
  if (f.followUp === "overdue") and.push({ followUpAt: { lt: new Date() }, status: { notIn: ["WON", "LOST"] } });
  if (f.followUp === "due") and.push({ followUpAt: { not: null }, status: { notIn: ["WON", "LOST"] } });

  return and.length ? { AND: and } : {};
}

export const leadListInclude = {
  assignedTo: { select: { id: true, name: true } },
  _count: { select: { attachments: true, notes: true } },
} satisfies Prisma.LeadInclude;

export async function listLeads(f: LeadFilters) {
  const perPage = Math.min(Math.max(f.perPage ?? 20, 5), 100);
  const page = Math.max(f.page ?? 1, 1);
  const where = buildLeadWhere(f);
  const sort = SORTABLE.has(f.sort ?? "") ? (f.sort as string) : "createdAt";
  const dir: "asc" | "desc" = f.dir === "asc" ? "asc" : "desc";

  const [total, rows] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      include: leadListInclude,
      orderBy: { [sort]: dir },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Everything the Kanban board needs (capped per column to keep the page light). */
export async function boardLeads(f: LeadFilters, perColumn = 40) {
  const where = buildLeadWhere({ ...f, status: undefined });
  const columns: Record<string, Awaited<ReturnType<typeof fetchColumn>>> = {};
  const counts = await db.lead.groupBy({ by: ["status"], where, _count: { _all: true } });
  await Promise.all(
    Object.values(LeadStatus).map(async (s) => {
      columns[s] = await fetchColumn(where, s, perColumn);
    }),
  );
  const totals = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  return { columns, totals };
}

function fetchColumn(where: Prisma.LeadWhereInput, status: LeadStatus, take: number) {
  return db.lead.findMany({
    where: { AND: [where, { status }] },
    include: leadListInclude,
    orderBy: [{ followUpAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take,
  });
}

export const staffForAssignment = () =>
  db.user.findMany({
    where: { active: true, role: { in: ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
