import { DocumentType } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { storage } from "@/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Friendly aliases so the website can link to a stable address. */
const ALIASES: Record<string, DocumentType> = {
  "company-profile": "COMPANY_PROFILE",
  "capability-statement": "CAPABILITY_STATEMENT",
  brochure: "BROCHURE",
};

/**
 * Public document download. Only documents explicitly marked public are ever
 * served — everything else returns 404 (not 403, so existence is not revealed).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const type = ALIASES[slug];

  const doc = await db.document.findFirst({
    where: type ? { type, isPublic: true, mediaId: { not: null } } : { id: slug, isPublic: true, mediaId: { not: null } },
    orderBy: { updatedAt: "desc" },
    include: { media: true },
  });
  if (!doc?.media) return new Response("Not found", { status: 404 });

  const file = await storage().get(doc.media.storageKey);
  if (!file) return new Response("Not found", { status: 404 });

  const niceName = `${doc.title.replace(/[^A-Za-z0-9._ -]+/g, "").trim() || "document"}.${doc.media.fileName.split(".").pop()}`;
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": doc.media.mimeType,
      "Content-Length": String(file.body.length),
      "Content-Disposition": `inline; filename="${niceName}"`,
      // Documents can be replaced, so keep caching short.
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
