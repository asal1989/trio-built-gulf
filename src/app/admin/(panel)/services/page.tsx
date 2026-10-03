import Link from "next/link";
import { Badge, button, DataTable, EmptyState, PageHeading, td, th } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { toggleServicePublished } from "./actions";

export default async function ServicesPage() {
  const user = await requirePage("service:view");
  const canManage = can(user, "service:manage");
  const services = await db.service.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { leads: true, projects: true } } },
  });

  return (
    <>
      <PageHeading
        title="Services"
        subtitle="Each published service gets its own page on the website."
        actions={canManage ? <Link href="/admin/services/new/" className={button("teal")}>+ New service</Link> : undefined}
      />
      {services.length === 0 ? (
        <EmptyState title="No services yet" text="Add your first service to publish a page for it." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>Order</th>
              <th className={th}>Service</th>
              <th className={th}>Page</th>
              <th className={th}>Status</th>
              <th className={th}>Enquiries</th>
              <th className={th}>Projects</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-mist/50">
                <td className={`${td} w-16 tabular-nums text-navy/60`}>{s.order}</td>
                <td className={td}>
                  <Link href={`/admin/services/${s.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {s.label}
                  </Link>
                  <div className="max-w-md truncate text-xs text-navy/55">{s.shortDescription}</div>
                </td>
                <td className={td}>
                  {s.published ? (
                    <a href={`/services/${s.slug}/`} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:underline">
                      /services/{s.slug}/ ↗
                    </a>
                  ) : (
                    <span className="text-xs text-navy/40">/services/{s.slug}/</span>
                  )}
                </td>
                <td className={td}>
                  <Badge tone={s.published ? "green" : "neutral"}>{s.published ? "Published" : "Draft"}</Badge>
                </td>
                <td className={`${td} tabular-nums`}>{s._count.leads}</td>
                <td className={`${td} tabular-nums`}>{s._count.projects}</td>
                <td className={`${td} text-right`}>
                  {canManage ? (
                    <form action={toggleServicePublished} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button className={button("secondary", true)}>{s.published ? "Unpublish" : "Publish"}</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
