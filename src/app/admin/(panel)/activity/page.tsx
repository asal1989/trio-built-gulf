import Link from "next/link";
import { Badge, button, DataTable, EmptyState, formatDate, inputCls, PageHeading, Pagination, td, th, type Tone } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

const PER = 40;
const TONE: Record<string, Tone> = {
  LOGIN: "green",
  LOGOUT: "neutral",
  LOGIN_FAILED: "red",
  CREATE: "teal",
  UPDATE: "blue",
  DELETE: "red",
  STATUS_CHANGE: "gold",
  UPLOAD: "purple",
  USER_CHANGE: "orange",
  SEND: "teal",
  DOWNLOAD: "neutral",
};

/** A short, readable device description from a User-Agent string. */
function device(ua: string | null): string {
  if (!ua) return "—";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return [browser, os].filter(Boolean).join(" · ");
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("audit:view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where = {
    ...(sp.user ? { userId: sp.user } : {}),
    ...(sp.action ? { action: sp.action } : {}),
    ...(sp.entity ? { entity: sp.entity } : {}),
    ...(sp.q ? { summary: { contains: sp.q, mode: "insensitive" as const } } : {}),
    ...(sp.from || sp.to
      ? { createdAt: { ...(sp.from ? { gte: new Date(`${sp.from}T00:00:00+04:00`) } : {}), ...(sp.to ? { lte: new Date(`${sp.to}T23:59:59+04:00`) } : {}) } }
      : {}),
  };

  const [total, rows, users, actions, entities] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER, include: { user: { select: { name: true } } } }),
    db.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
    db.auditLog.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } }),
  ]);

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const k of ["user", "action", "entity", "q", "from", "to"] as const) if (sp[k]) q.set(k, sp[k] as string);
    if (p > 1) q.set("page", String(p));
    return `/admin/activity/${q.toString() ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHeading title="Activity log" subtitle={`${total.toLocaleString()} recorded event${total === 1 ? "" : "s"} — sign-ins, changes, uploads and user management.`} />
      <form className="mb-5 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-2 lg:grid-cols-6">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search…" aria-label="Search" className={`${inputCls} lg:col-span-2`} />
        <select name="user" defaultValue={sp.user ?? ""} aria-label="User" className={inputCls}>
          <option value="">Any user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select name="action" defaultValue={sp.action ?? ""} aria-label="Action" className={inputCls}>
          <option value="">Any action</option>
          {actions.map((a) => (
            <option key={a.action}>{a.action}</option>
          ))}
        </select>
        <select name="entity" defaultValue={sp.entity ?? ""} aria-label="Record type" className={inputCls}>
          <option value="">Any record</option>
          {entities.map((e) => (
            <option key={e.entity}>{e.entity}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input type="date" name="from" defaultValue={sp.from ?? ""} aria-label="From" className={inputCls} />
          <input type="date" name="to" defaultValue={sp.to ?? ""} aria-label="To" className={inputCls} />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6 lg:justify-end">
          <button className={button("primary")}>Apply</button>
          <Link href="/admin/activity/" className={button("secondary")}>
            Reset
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No activity matches" />
      ) : (
        <>
          <DataTable>
            <thead>
              <tr>
                <th className={th}>When</th>
                <th className={th}>User</th>
                <th className={th}>Action</th>
                <th className={th}>Record</th>
                <th className={th}>Details</th>
                <th className={th}>IP / device</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={`${td} whitespace-nowrap text-xs`}>{formatDate(r.createdAt, true)}</td>
                  <td className={td}>{r.user?.name ?? <span className="text-navy/40">System / visitor</span>}</td>
                  <td className={td}>
                    <Badge tone={TONE[r.action] ?? "neutral"}>{r.action.replace("_", " ").toLowerCase()}</Badge>
                  </td>
                  <td className={`${td} text-xs`}>{r.entity}</td>
                  <td className={`${td} max-w-md text-sm`}>{r.summary}</td>
                  <td className={`${td} text-xs text-navy/55`}>
                    {r.ip ?? "—"}
                    <div>{device(r.userAgent)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <Pagination page={page} pages={Math.max(1, Math.ceil(total / PER))} hrefFor={href} />
        </>
      )}
      <p className="mt-4 text-xs text-navy/45">IP address and device are stored for security auditing only and are visible to administrators.</p>
    </>
  );
}
