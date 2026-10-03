export const dynamic = "force-dynamic";

/** Liveness probe for Railway. Deliberately does not touch the database. */
export function GET() {
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
