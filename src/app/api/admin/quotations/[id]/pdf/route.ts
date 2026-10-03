import { AuthError, requirePermission } from "@/server/auth/session";
import { db } from "@/server/db";
import { renderQuotationPdf } from "@/server/quotations/pdf";
import { getContactSettingsFresh, getCrmSettings } from "@/server/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("quote:view");
  } catch (e) {
    return new Response("Unauthorized", { status: e instanceof AuthError ? e.status : 401 });
  }
  const { id } = await ctx.params;
  const q = await db.quotation.findUnique({ where: { id }, include: { items: { orderBy: { position: "asc" } } } });
  if (!q) return new Response("Not found", { status: 404 });

  const [contact, crm] = await Promise.all([getContactSettingsFresh(), getCrmSettings()]);
  const pdf = await renderQuotationPdf(
    {
      number: q.number,
      status: q.status,
      createdAt: q.createdAt,
      validUntil: q.validUntil,
      customerName: q.customerName,
      companyName: q.companyName,
      email: q.email,
      phone: q.phone,
      projectName: q.projectName,
      projectLocation: q.projectLocation,
      description: q.description,
      currency: q.currency,
      taxRate: Number(q.taxRate),
      items: q.items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unit: i.unit,
        unitPrice: Number(i.unitPrice),
        lineTotal: Number(i.lineTotal),
      })),
      subtotal: Number(q.subtotal),
      discount: Number(q.discount),
      taxAmount: Number(q.taxAmount),
      total: Number(q.total),
      terms: q.terms,
    },
    contact,
    crm,
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${q.number}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
