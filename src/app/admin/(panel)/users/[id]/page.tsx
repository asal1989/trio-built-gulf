import Link from "next/link";
import { notFound } from "next/navigation";
import { EditUserForm, ResetPassword } from "@/components/admin/UserForms";
import { Badge, formatDate, PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { ROLE_LABELS } from "@/server/auth/permissions";
import { db } from "@/server/db";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePage("user:manage");
  const { id } = await params;
  const u = await db.user.findUnique({ where: { id }, include: { sessions: { orderBy: { lastSeenAt: "desc" }, take: 5 } } });
  if (!u) notFound();

  return (
    <>
      <Link href="/admin/users/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All users
      </Link>
      <PageHeading
        title={u.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {u.email}
            <Badge tone={u.active ? "green" : "red"}>{u.active ? "Active" : "Deactivated"}</Badge>
            <span>{ROLE_LABELS[u.role]}</span>
            <span className="text-navy/45">Last sign-in {u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "never"}</span>
          </span>
        }
        actions={<ResetPassword id={u.id} name={u.name} />}
      />
      <EditUserForm
        isSelf={u.id === me.id}
        canEditSuper={me.role === "SUPER_ADMIN"}
        user={{ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, extraPermissions: u.extraPermissions }}
      />
      {u.sessions.length > 0 ? (
        <section className="mt-6 rounded-xl border border-line bg-white p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-navy">Recent sessions</h2>
          <ul className="mt-3 divide-y divide-line/70 text-sm">
            {u.sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="truncate text-navy/80">{s.userAgent ?? "Unknown device"}</span>
                <span className="text-xs text-navy/50">
                  {s.ip ?? "—"} · {formatDate(s.lastSeenAt, true)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
