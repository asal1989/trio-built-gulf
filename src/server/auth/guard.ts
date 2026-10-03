import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";
import { can, type Permission } from "./permissions";

/**
 * For pages and layouts. Redirects instead of throwing:
 *  - not signed in            -> /admin/login
 *  - must change password     -> /admin/account
 *  - signed in without access -> /admin/forbidden
 */
export async function requirePage(permission?: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login/");
  if (user.mustChangePassword) redirect("/admin/account/?required=1");
  if (permission && !can(user, permission)) redirect("/admin/forbidden/");
  return user;
}

/** Signed in, but without the forced-password-change redirect (used by the account page itself). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login/");
  return user;
}
