import { AuthError, requirePermission } from "@/server/auth/session";
import { audit } from "@/server/audit";
import { db } from "@/server/db";
import { storage } from "@/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Private lead attachments are never public. A signed-in user with lead access
 * is redirected to a short-lived signed URL (5 minutes) for the file.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requirePermission("lead:view");
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return new Response("Unauthorized", { status });
  }

  const { id } = await ctx.params;
  const att = await db.leadAttachment.findUnique({ where: { id }, include: { lead: { select: { number: true } } } });
  if (!att) return new Response("Not found", { status: 404 });

  const url = await storage().signedUrl(att.storageKey, { expiresIn: 300, fileName: att.fileName });
  await audit({
    userId: user.id,
    action: "DOWNLOAD",
    entity: "LeadAttachment",
    entityId: att.id,
    summary: `Downloaded ${att.fileName} (L-${String(att.lead.number).padStart(6, "0")})`,
  });
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}
