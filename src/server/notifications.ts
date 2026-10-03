import "server-only";
import { db } from "./db";

type NotifyInput = { type: string; title: string; body?: string; link?: string };

/**
 * In-app notifications are created per recipient so each person has their own
 * read state.
 */
export async function notifyUsers(userIds: string[], input: NotifyInput): Promise<void> {
  const unique = [...new Set(userIds)];
  if (!unique.length) return;
  await db.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    })),
  });
}

/** Everyone who administers the site (Super Admin and Admin roles). */
export async function adminUserIds(): Promise<string[]> {
  const rows = await db.user.findMany({
    where: { active: true, role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function notifyAdmins(input: NotifyInput, alsoUserIds: (string | null | undefined)[] = []) {
  const ids = [...(await adminUserIds()), ...(alsoUserIds.filter(Boolean) as string[])];
  await notifyUsers(ids, input);
}
