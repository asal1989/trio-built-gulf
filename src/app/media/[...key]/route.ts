import { db } from "@/server/db";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

/**
 * Public media (project photos, service images, public documents).
 * Only objects flagged `isPublic` are served here; private files are only ever
 * reachable through short-lived signed URLs from the admin.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");

  const media = await db.media.findFirst({ where: { storageKey: key, isPublic: true } });
  if (!media) return new Response("Not found", { status: 404 });

  const file = await storage().get(key);
  if (!file) return new Response("Not found", { status: 404 });

  const inline = media.mimeType.startsWith("image/") || media.mimeType === "application/pdf";
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(file.body.length),
      // Keys contain a random component, so a given URL never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${media.fileName.replace(/["\\\r\n]/g, "_")}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
