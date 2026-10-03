import { verifyLocalSignature } from "@/server/storage/local";
import { storage, usingCloudStorage } from "@/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Local-development file server for signed URLs. Disabled when cloud storage
 * is configured (S3 serves its own signed URLs). Requires a valid, unexpired
 * HMAC signature — keys alone are not enough.
 */
export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  if (usingCloudStorage()) return new Response("Not found", { status: 404 });

  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");
  const url = new URL(req.url);
  const exp = url.searchParams.get("exp") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  const name = url.searchParams.get("name") ?? undefined;
  if (!verifyLocalSignature(key, exp, sig, name)) return new Response("Link expired or invalid", { status: 403 });

  const file = await storage().get(key);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": name ? `attachment; filename="${name.replace(/["\\r\n]/g, "_")}"` : "attachment",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
