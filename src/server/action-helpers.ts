import "server-only";
import { z } from "zod";
import { AuthError, requirePermission, type SessionUser } from "./auth/session";
import type { Permission } from "./auth/permissions";

export type ActionResult = { error?: string; ok?: string; fieldErrors?: Record<string, string>; id?: string };

/** Turn zod issues into { field: message }. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/**
 * Wraps a Server Action body: checks the permission first, converts auth errors
 * and unexpected failures into a user-facing { error } instead of a crash page.
 * Redirects (thrown by next/navigation) pass straight through.
 */
export async function guarded(
  permission: Permission,
  fn: (user: SessionUser) => Promise<ActionResult | void>,
): Promise<ActionResult> {
  try {
    const user = await requirePermission(permission);
    return (await fn(user)) ?? {};
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    // Next's redirect()/notFound() are implemented as thrown errors with a digest.
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("action failed", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/** Read a string field from FormData, trimmed; empty string when absent. */
export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
