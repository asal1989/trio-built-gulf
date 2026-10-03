import { AuthError, requirePermission } from "@/server/auth/session";
import { db } from "@/server/db";
import { mediaUrl } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** JSON feed for the media picker: public images only, newest first. */
export async function GET(req: Request) {
  try {
    await requirePermission("media:view");
  } catch (e) {
    return new Response("Unauthorized", { status: e instanceof AuthError ? e.status : 401 });
  }
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");

  const items = await db.media.findMany({
    where: {
      isPublic: true,
      mimeType: { startsWith: "image/" },
      ...(q ? { OR: [{ fileName: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] } : {}),
      ...(category && category !== "ALL" ? { category: category as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return Response.json(
    items.map((m) => ({ id: m.id, url: mediaUrl(m.storageKey), alt: m.alt ?? "", name: m.fileName, w: m.width, h: m.height })),
    { headers: { "Cache-Control": "no-store" } },
  );
}
