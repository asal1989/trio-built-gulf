import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "../db";
import { clientInfo } from "../request";
import { can, type Permission } from "./permissions";

const SECURE = process.env.NODE_ENV === "production";
/** `__Host-` prefix pins the cookie to this exact host over HTTPS. */
export const SESSION_COOKIE = SECURE ? "__Host-tbg_session" : "tbg_session";

const SESSION_DAYS = 7;
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const { ip, userAgent } = await clientInfo();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { userId, tokenHash: hashToken(token), ip, userAgent, expiresAt },
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: import("@/generated/prisma/enums").Role;
  extraPermissions: string[];
  mustChangePassword: boolean;
  sessionId: string;
};

/**
 * The signed-in user for this request, or null. Memoised per request with
 * React `cache`, so layouts and pages can both call it for one DB lookup.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.active) return null;

  // Sliding expiry: extend at most once a day to keep writes low.
  if (Date.now() - session.lastSeenAt.getTime() > REFRESH_AFTER_MS) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date(), expiresAt } });
  }

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    extraPermissions: u.extraPermissions,
    mustChangePassword: u.mustChangePassword,
    sessionId: session.id,
  };
});

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** For Server Actions and route handlers: throws instead of redirecting. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError(401, "Please sign in again.");
  if (!can(user, permission)) throw new AuthError(403, "You do not have permission to do that.");
  return user;
}
