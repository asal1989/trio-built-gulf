import Link from "next/link";
import { NewUserButton } from "@/components/admin/UserForms";
import { Badge, Card, DataTable, formatDate, PageHeading, td, th, type Tone } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can, ROLE_LABELS, ROLE_PERMISSIONS } from "@/server/auth/permissions";
import { db } from "@/server/db";

const TONE: Record<string, Tone> = { SUPER_ADMIN: "purple", ADMIN: "blue", SALES: "teal", PROJECT_MANAGER: "orange", CONTENT_MANAGER: "gold", VIEWER: "neutral" };

export default async function UsersPage() {
  const me = await requirePage("user:view");
  const canManage = can(me, "user:manage");
  const users = await db.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }], include: { _count: { select: { assignedLeads: true } } } });

  return (
    <>
      <PageHeading
        title="Users & roles"
        subtitle="Control who can sign in and what they can do."
        actions={canManage ? <NewUserButton canCreateSuper={me.role === "SUPER_ADMIN"} /> : undefined}
      />
      <DataTable>
        <thead>
          <tr>
            <th className={th}>User</th>
            <th className={th}>Role</th>
            <th className={th}>Status</th>
            <th className={th}>Assigned leads</th>
            <th className={th}>Last sign-in</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-mist/50">
              <td className={td}>
                {canManage ? (
                  <Link href={`/admin/users/${u.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {u.name}
                  </Link>
                ) : (
                  <span className="font-semibold">{u.name}</span>
                )}
                {u.id === me.id ? <span className="ml-2 text-xs text-navy/45">(you)</span> : null}
                <div className="text-xs text-navy/55">{u.email}</div>
              </td>
              <td className={td}>
                <Badge tone={TONE[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                {u.extraPermissions.length ? <span className="ml-1.5 text-xs text-navy/45">+{u.extraPermissions.length} extra</span> : null}
              </td>
              <td className={td}>
                <Badge tone={u.active ? "green" : "red"}>{u.active ? "Active" : "Deactivated"}</Badge>
              </td>
              <td className={`${td} tabular-nums`}>{u._count.assignedLeads}</td>
              <td className={td}>{u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "Never"}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <Card className="mt-6" title="What each role can do">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]).map((r) => (
            <div key={r} className="rounded-lg border border-line p-4">
              <Badge tone={TONE[r]}>{ROLE_LABELS[r]}</Badge>
              <p className="mt-2 text-xs leading-relaxed text-navy/65">
                {r === "SUPER_ADMIN" || r === "ADMIN"
                  ? "Everything, including users and settings."
                  : [...new Set(ROLE_PERMISSIONS[r].map((p) => p.split(":")[0]))].join(", ")}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
