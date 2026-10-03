import Link from "next/link";
import { revalidatePath } from "next/cache";
import { button, EmptyState, formatDate, PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

export default async function NotificationsPage() {
  const user = await requirePage();
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });

  async function markAll() {
    "use server";
    const me = await requirePage();
    await db.notification.updateMany({ where: { userId: me.id, readAt: null }, data: { readAt: new Date() } });
    revalidatePath("/admin/", "layout");
  }

  async function open(fd: FormData) {
    "use server";
    const me = await requirePage();
    const id = String(fd.get("id") ?? "");
    const n = await db.notification.findFirst({ where: { id, userId: me.id } });
    if (n && !n.readAt) await db.notification.update({ where: { id }, data: { readAt: new Date() } });
    revalidatePath("/admin/", "layout");
    const { redirect } = await import("next/navigation");
    // Only ever redirect to a path inside the admin.
    redirect(n?.link && n.link.startsWith("/admin/") ? n.link : "/admin/notifications/");
  }

  const unread = items.filter((i) => !i.readAt).length;

  return (
    <>
      <PageHeading
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You are all caught up."}
        actions={
          unread ? (
            <form action={markAll}>
              <button className={button("secondary")}>Mark all as read</button>
            </form>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No notifications yet" text="New website enquiries, assignments and quotation updates appear here." action={<Link href="/admin/leads/" className={button("primary")}>View leads</Link>} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {items.map((n) => (
            <li key={n.id}>
              <form action={open}>
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-mist/60 ${n.readAt ? "" : "bg-teal/5"}`}>
                  <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-teal"}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.readAt ? "text-navy/75" : "font-semibold text-navy"}`}>{n.title}</span>
                    {n.body ? <span className="block truncate text-xs text-navy/55">{n.body}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-navy/45">{formatDate(n.createdAt, true)}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
