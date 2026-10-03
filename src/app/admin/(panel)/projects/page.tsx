import Link from "next/link";
import { Badge, button, DataTable, EmptyState, formatDate, inputCls, PageHeading, td, th, type Tone } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { toggleProjectPublished } from "./actions";

const TONE: Record<string, Tone> = { UPCOMING: "blue", ONGOING: "gold", COMPLETED: "green" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const user = await requirePage("project:view");
  const sp = await searchParams;
  const canManage = can(user, "project:manage");
  const projects = await db.project.findMany({
    where: {
      ...(sp.status && ["UPCOMING", "ONGOING", "COMPLETED"].includes(sp.status) ? { status: sp.status as "UPCOMING" } : {}),
      ...(sp.q
        ? {
            OR: [
              { name: { contains: sp.q, mode: "insensitive" } },
              { client: { contains: sp.q, mode: "insensitive" } },
              { location: { contains: sp.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { services: { select: { label: true } }, _count: { select: { gallery: true } } },
  });

  return (
    <>
      <PageHeading
        title="Projects"
        subtitle="Published projects appear on the website's Projects page."
        actions={
          canManage ? (
            <Link href="/admin/projects/new/" className={button("teal")}>
              + New project
            </Link>
          ) : undefined
        }
      />
      <form className="mb-5 flex flex-wrap gap-2 rounded-xl border border-line bg-white p-3">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search projects…" aria-label="Search" className={`${inputCls} max-w-xs flex-1`} />
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={`${inputCls} !w-auto`}>
          <option value="">All statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <button className={button("primary")}>Filter</button>
      </form>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          text="Add real, approved project records. Until you publish one, the website shows its capability categories instead."
          action={
            canManage ? (
              <Link href="/admin/projects/new/" className={button("teal")}>
                Add a project
              </Link>
            ) : undefined
          }
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>Project</th>
              <th className={th}>Status</th>
              <th className={th}>Location</th>
              <th className={th}>Services</th>
              <th className={th}>Dates</th>
              <th className={th}>Website</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-mist/50">
                <td className={td}>
                  <Link href={`/admin/projects/${p.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {p.name}
                  </Link>
                  <div className="text-xs text-navy/55">
                    {[p.client, p.projectType].filter(Boolean).join(" · ")}
                    {p.featured ? " · ⭐ featured" : ""}
                  </div>
                </td>
                <td className={td}>
                  <Badge tone={TONE[p.status]}>{p.status.charAt(0) + p.status.slice(1).toLowerCase()}</Badge>
                </td>
                <td className={td}>{p.location ?? "—"}</td>
                <td className={td}>
                  <div className="max-w-[14rem] truncate text-xs">{p.services.map((s) => s.label).join(", ") || "—"}</div>
                </td>
                <td className={`${td} text-xs`}>
                  {formatDate(p.startDate)} → {formatDate(p.completionDate)}
                </td>
                <td className={td}>
                  <Badge tone={p.published ? "green" : "neutral"}>{p.published ? "Published" : "Draft"}</Badge>
                </td>
                <td className={`${td} text-right`}>
                  {canManage ? (
                    <form action={toggleProjectPublished} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button className={button("secondary", true)}>{p.published ? "Unpublish" : "Publish"}</button>
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
