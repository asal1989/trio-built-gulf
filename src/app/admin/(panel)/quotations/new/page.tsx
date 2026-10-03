import Link from "next/link";
import QuotationEditor, { type EditorQuote } from "@/components/admin/QuotationEditor";
import { PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";
import { getCrmSettings } from "@/server/settings";
import { nowMs } from "@/lib/time";

export default async function NewQuotationPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  await requirePage("quote:manage");
  const { leadId } = await searchParams;
  const crm = await getCrmSettings();
  const lead = leadId ? await db.lead.findUnique({ where: { id: leadId } }) : null;

  const valid = new Date(nowMs() + crm.quoteValidityDays * 86400_000 + 4 * 3600_000);
  const initial: EditorQuote = {
    leadId: lead?.id,
    customerName: lead?.name ?? "",
    companyName: lead?.company ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    projectName: lead?.serviceLabel ? `${lead.serviceLabel}${lead.location ? ` — ${lead.location}` : ""}` : "",
    projectLocation: lead?.location ?? "",
    description: lead?.message ?? "",
    taxRate: crm.vatRate,
    discount: 0,
    terms: crm.quoteTerms,
    validUntil: valid.toISOString().slice(0, 10),
    items: [{ description: lead?.serviceLabel ?? "", quantity: 1, unit: "nos", unitPrice: 0 }],
  };

  return (
    <>
      <Link href={lead ? `/admin/leads/${lead.id}/` : "/admin/quotations/"} className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← Back
      </Link>
      <PageHeading title="New quotation" subtitle={lead ? `For ${lead.name}` : "Blank quotation"} />
      <QuotationEditor initial={initial} />
    </>
  );
}
