import Link from "next/link";
import { StatusBadge, leadCode } from "@/components/admin/lead-ui";
import { Badge, Card, EmptyState, PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requirePage();
  const q = (await searchParams).q?.trim() ?? "";

  if (q.length < 2) {
    return (
      <>
        <PageHeading title="Search" />
        <EmptyState title="Type at least two characters" text="Search leads, quotations, projects, services and users from the box at the top." />
      </>
    );
  }

  const ci = { contains: q, mode: "insensitive" as const };
  const num = Number(q.replace(/^l-?/i, ""));

  const [leads, quotes, projects, services, users] = await Promise.all([
    can(user, "lead:view")
      ? db.lead.findMany({
          where: { OR: [{ name: ci }, { company: ci }, { email: ci }, { phone: { contains: q } }, { serviceLabel: ci }, { location: ci }, ...(Number.isInteger(num) && num > 0 ? [{ number: num }] : [])] },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : [],
    can(user, "quote:view")
      ? db.quotation.findMany({ where: { OR: [{ number: ci }, { customerName: ci }, { companyName: ci }, { projectName: ci }] }, orderBy: { createdAt: "desc" }, take: 8 })
      : [],
    can(user, "project:view") ? db.project.findMany({ where: { OR: [{ name: ci }, { client: ci }, { location: ci }] }, take: 8 }) : [],
    can(user, "service:view") ? db.service.findMany({ where: { OR: [{ name: ci }, { label: ci }, { slug: ci }] }, take: 8 }) : [],
    can(user, "user:view") ? db.user.findMany({ where: { OR: [{ name: ci }, { email: ci }] }, take: 5 }) : [],
  ]);

  const total = leads.length + quotes.length + projects.length + services.length + users.length;

  return (
    <>
      <PageHeading title={`Results for “${q}”`} subtitle={`${total} match${total === 1 ? "" : "es"}`} />
      {total === 0 ? <EmptyState title="Nothing found" text="Try a name, phone number, lead number (L-000123) or quotation number." /> : null}
      <div className="space-y-5">
        {leads.length > 0 ? (
          <Card title="Leads">
            <ul className="divide-y divide-line/70">
              {leads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/leads/${l.id}/`} className="min-w-0 font-semibold text-navy hover:text-teal-700">
                    {l.name} <span className="font-normal text-navy/45">{leadCode(l.number)}</span>
                    <span className="block truncate text-xs font-normal text-navy/55">{[l.company, l.serviceLabel, l.location].filter(Boolean).join(" · ")}</span>
                  </Link>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {quotes.length > 0 ? (
          <Card title="Quotations">
            <ul className="divide-y divide-line/70">
              {quotes.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/quotations/${x.id}/`} className="font-semibold text-teal-700 hover:underline">
                    {x.number} <span className="font-normal text-navy">— {x.customerName}</span>
                  </Link>
                  <Badge>{x.status.toLowerCase()}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {projects.length > 0 ? (
          <Card title="Projects">
            <ul className="divide-y divide-line/70">
              {projects.map((p) => (
                <li key={p.id} className="py-2.5 text-sm">
                  <Link href={`/admin/projects/${p.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {p.name}
                  </Link>
                  <span className="ml-2 text-xs text-navy/55">{[p.client, p.location].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {services.length > 0 ? (
          <Card title="Services">
            <ul className="divide-y divide-line/70">
              {services.map((s) => (
                <li key={s.id} className="py-2.5 text-sm">
                  <Link href={`/admin/services/${s.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {users.length > 0 ? (
          <Card title="Users">
            <ul className="divide-y divide-line/70">
              {users.map((u) => (
                <li key={u.id} className="py-2.5 text-sm">
                  <Link href={`/admin/users/${u.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {u.name}
                  </Link>
                  <span className="ml-2 text-xs text-navy/55">{u.email}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
