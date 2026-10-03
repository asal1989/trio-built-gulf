import "server-only";
import { headers } from "next/headers";

/** Client IP as seen behind Railway's proxy. Used for rate limiting and audit only. */
export async function clientInfo(): Promise<{ ip: string | null; userAgent: string | null }> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim() || null;
  const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
  return { ip, userAgent };
}

/**
 * CSRF defence for cookie-authenticated route handlers: the request must come
 * from our own origin. (Server Actions are protected by Next itself.)
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return; // non-browser clients (curl) carry no cookie anyway
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Response("Bad origin", { status: 403 });
  }
  if (!host || originHost !== host) throw new Response("Cross-origin request blocked", { status: 403 });
}
