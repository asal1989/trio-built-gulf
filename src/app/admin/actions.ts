"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/server/audit";
import { hashPassword, passwordProblems, verifyPassword } from "@/server/auth/password";
import { createSession, destroyAllSessions, destroySession, getSessionUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { clearRateLimit, rateLimit } from "@/server/ratelimit";
import { clientInfo } from "@/server/request";

export type FormState = { error?: string; ok?: string } | undefined;

// A real scrypt hash of a throw-away value, so unknown emails cost the same time as wrong passwords.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password-" + Date.now()));

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const { email, password } = parsed.data;

  const { ip } = await clientInfo();
  const byIp = await rateLimit(`login:ip:${ip ?? "unknown"}`, 20, 15 * 60);
  const byEmail = await rateLimit(`login:email:${email}`, 6, 15 * 60);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.ceil(Math.max(byIp.retryAfter, byEmail.retryAfter) / 60);
    return { error: `Too many attempts. Try again in about ${wait} minute${wait === 1 ? "" : "s"}.` };
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

  if (!user || !valid || !user.active) {
    await audit({ userId: user?.id, action: "LOGIN_FAILED", entity: "User", entityId: user?.id, summary: `Failed sign-in for ${email}` });
    return { error: "Incorrect email or password." };
  }

  await clearRateLimit(`login:email:${email}`);
  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id, summary: `${user.name} signed in` });

  redirect(user.mustChangePassword ? "/admin/account/?required=1" : "/admin/");
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  if (user) await audit({ userId: user.id, action: "LOGOUT", entity: "User", entityId: user.id, summary: `${user.name} signed out` });
  await destroySession();
  redirect("/admin/login/");
}

const ChangePasswordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(1).max(200),
  confirm: z.string(),
});

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login/");

  const parsed = ChangePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: "Fill in all fields." };
  const { current, next, confirm } = parsed.data;
  if (next !== confirm) return { error: "The new passwords do not match." };

  const problems = passwordProblems(next);
  if (problems.length) return { error: `New password needs ${problems.join(", ")}.` };
  if (next === current) return { error: "Choose a password different from the current one." };

  const limited = await rateLimit(`pwchange:${user.id}`, 8, 15 * 60);
  if (!limited.allowed) return { error: "Too many attempts. Try again later." };

  const row = await db.user.findUnique({ where: { id: user.id } });
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { error: "Current password is incorrect." };

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), mustChangePassword: false },
  });
  // Sign out every session (including other devices) and start a fresh one.
  await destroyAllSessions(user.id);
  await createSession(user.id);
  await audit({ userId: user.id, action: "USER_CHANGE", entity: "User", entityId: user.id, summary: `${user.name} changed their password` });
  redirect("/admin/");
}
