"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";
import { audit } from "@/server/audit";
import { guarded, fieldErrorsFrom, str, type ActionResult } from "@/server/action-helpers";
import { hashPassword } from "@/server/auth/password";
import { PERMISSIONS } from "@/server/auth/permissions";
import { destroyAllSessions, type SessionUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email/send";
import { accountEmail } from "@/server/email/templates";

const refresh = () => revalidatePath("/admin/users/", "page");

/** Strong, readable temporary password: shown once, must be changed at first sign-in. */
const tempPassword = () => `${randomBytes(9).toString("base64url")}aA1`;

/** Only a Super Admin may create, edit or promote Super Admins. */
function canTouchRole(actor: SessionUser, role: Role): boolean {
  return actor.role === "SUPER_ADMIN" || role !== "SUPER_ADMIN";
}

async function activeSuperAdmins(excludingId?: string) {
  return db.user.count({ where: { role: "SUPER_ADMIN", active: true, NOT: excludingId ? { id: excludingId } : undefined } });
}

const CreateSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(200),
  role: z.nativeEnum(Role),
});

export async function createUser(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("user:manage", async (actor) => {
    const parsed = CreateSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email"), role: str(fd, "role") });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", fieldErrors: fieldErrorsFrom(parsed.error) };
    const d = parsed.data;
    if (!canTouchRole(actor, d.role)) return { error: "Only a Super Admin can create another Super Admin." };
    if (await db.user.findUnique({ where: { email: d.email } })) return { error: "A user with that email already exists." };

    const password = tempPassword();
    const user = await db.user.create({
      data: { name: d.name, email: d.email, role: d.role, passwordHash: await hashPassword(password), mustChangePassword: true },
    });
    await audit({ userId: actor.id, action: "USER_CHANGE", entity: "User", entityId: user.id, summary: `Created user ${user.email} (${user.role})` });

    const siteUrl = process.env.SITE_URL ?? "https://triobuiltgulf.ae";
    const mail = accountEmail({
      name: d.name,
      loginUrl: `${siteUrl}/admin/login/`,
      note: "An admin account has been created for you. Your administrator will give you your temporary password; you will be asked to choose your own when you first sign in.",
    });
    await sendEmail({ to: d.email, ...mail });

    refresh();
    return { ok: `User ${user.email} created.`, id: user.id, data: { password, email: user.email } };
  });
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Enter a name.").max(100),
  role: z.nativeEnum(Role),
  active: z.boolean(),
  extra: z.array(z.enum(PERMISSIONS)).default([]),
});

export async function updateUser(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("user:manage", async (actor) => {
    const parsed = UpdateSchema.safeParse({
      id: str(fd, "id"),
      name: str(fd, "name"),
      role: str(fd, "role"),
      active: fd.get("active") === "on",
      extra: fd.getAll("extra").map(String),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
    const d = parsed.data;

    const target = await db.user.findUnique({ where: { id: d.id } });
    if (!target) return { error: "User not found." };
    if (!canTouchRole(actor, target.role) || !canTouchRole(actor, d.role)) return { error: "Only a Super Admin can change a Super Admin." };

    if (target.id === actor.id) {
      if (d.role !== target.role) return { error: "You cannot change your own role." };
      if (!d.active) return { error: "You cannot deactivate your own account." };
    }
    const losingSuper = target.role === "SUPER_ADMIN" && (d.role !== "SUPER_ADMIN" || !d.active);
    if (losingSuper && (await activeSuperAdmins(target.id)) === 0) return { error: "There must always be at least one active Super Admin." };

    await db.user.update({
      where: { id: d.id },
      data: { name: d.name, role: d.role, active: d.active, extraPermissions: d.role === "SUPER_ADMIN" ? [] : d.extra },
    });
    // A change of role or deactivation takes effect immediately.
    if (d.role !== target.role || !d.active) await destroyAllSessions(d.id);

    await audit({
      userId: actor.id,
      action: "USER_CHANGE",
      entity: "User",
      entityId: d.id,
      summary: `Updated ${target.email}: role ${target.role}→${d.role}, ${d.active ? "active" : "deactivated"}, ${d.extra.length} extra permission(s)`,
    });
    refresh();
    return { ok: "User updated." };
  });
}

export async function resetUserPassword(_prev: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  return guarded("user:manage", async (actor) => {
    const target = await db.user.findUnique({ where: { id: str(fd, "id") } });
    if (!target) return { error: "User not found." };
    if (!canTouchRole(actor, target.role)) return { error: "Only a Super Admin can reset a Super Admin." };

    const password = tempPassword();
    await db.user.update({ where: { id: target.id }, data: { passwordHash: await hashPassword(password), mustChangePassword: true } });
    await destroyAllSessions(target.id);
    await audit({ userId: actor.id, action: "USER_CHANGE", entity: "User", entityId: target.id, summary: `Reset password for ${target.email}` });
    refresh();
    return { ok: "Password reset.", data: { password, email: target.email } };
  });
}
