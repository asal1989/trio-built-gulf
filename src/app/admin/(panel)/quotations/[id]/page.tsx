import Link from "next/link";
import { notFound } from "next/navigation";
import QuotationActions from "@/components/admin/QuotationActions";
import QuotationEditor from "@/components/admin/QuotationEditor";
import { Badge, Card, formatDate, formatMoney, PageHeading, type Tone } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";

const TONE: Record<string, Tone> = { DRAFT: "neutral", SENT: "gold", ACCEPTED: "green", REJECTED: "red", EXPIRED: "orange" };
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePage("quote:view");
  const { id } = await params;
  const q = await db.quotation.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: "asc" } },
      lead: { select: { id: true, number: true, name: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!q) notFound();

  const canManage = can(user, "quote:manage");
  const draft = q.status === "DRAFT" && canManage;

  return (
    <>
      <Link href="/admin/quotations/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All quotations
      </Link>
      <PageHeading
        title={q.number}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={TONE[q.status]}>{label(q.status)}</Badge>
            <span>{q.customerName}</span>
            {q.lead ? (
              <Link href={`/admin/leads/${q.lead.id}/`} className="text-teal-700 hover:underline">
                Lead L-{String(q.lead.number).padStart(6, "0")}
              </Link>
            ) : null}
            <span className="text-navy/45">
              Created {formatDate(q.createdAt)} by {q.createdBy?.name ?? "—"}
            </span>
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          {draft ? (
            <QuotationEditor
              initial={{
                id: q.id,
                leadId: q.leadId ?? undefined,
                customerName: q.customerName,
                companyName: q.companyName ?? "",
                email: q.email ?? "",
                phone: q.phone ?? "",
                projectName: q.projectName ?? "",
                projectLocation: q.projectLocation ?? "",
                description: q.description ?? "",
                taxRate: Number(q.taxRate),
                discount: Number(q.discount),
                terms: q.terms ?? "",
                validUntil: q.validUntil ? q.validUntil.toISOString().slice(0, 10) : "",
                items: q.items.map((i) => ({
                  description: i.description,
                  quantity: Number(i.quantity),
                  unit: i.unit,
                  unitPrice: Number(i.unitPrice),
                })),
              }}
            />
          ) : (
            <Card title="Quotation">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-navy/55">Customer</dt>
                  <dd className="font-medium">
                    {q.customerName}
                    {q.companyName ? `, ${q.companyName}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/55">Contact</dt>
                  <dd className="font-medium">{[q.email, q.phone].filter(Boolean).join(" · ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-navy/55">Project</dt>
                  <dd className="font-medium">{q.projectName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-navy/55">Valid until</dt>
                  <dd className="font-medium">{formatDate(q.validUntil)}</dd>
                </div>
              </dl>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-[0.1em] text-navy/55">
                      <th className="py-2 pr-3">#</th>
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3 text-right">Qty</th>
                      <th className="py-2 pr-3">Unit</th>
                      <th className="py-2 pr-3 text-right">Unit price</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.items.map((i, n) => (
                      <tr key={i.id} className="border-b border-line/70 align-top">
                        <td className="py-2.5 pr-3 text-navy/50">{n + 1}</td>
                        <td className="py-2.5 pr-3">{i.description}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{Number(i.quantity)}</td>
                        <td className="py-2.5 pr-3">{i.unit}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{Number(i.unitPrice).toFixed(2)}</td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">{Number(i.lineTotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <dl className="ml-auto mt-4 w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-navy/60">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(q.subtotal, q.currency)}</dd>
                </div>
                {Number(q.discount) > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-navy/60">Discount</dt>
                    <dd className="tabular-nums">- {formatMoney(q.discount, q.currency)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-navy/60">VAT ({Number(q.taxRate)}%)</dt>
                  <dd className="tabular-nums">{formatMoney(q.taxAmount, q.currency)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-navy">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(q.total, q.currency)}</dd>
                </div>
              </dl>
              {q.terms ? <p className="mt-5 whitespace-pre-wrap rounded-lg bg-mist p-4 text-xs text-navy/70">{q.terms}</p> : null}
              {q.sentAt ? (
                <p className="mt-4 text-xs text-navy/50">
                  Sent {formatDate(q.sentAt, true)}
                  {q.respondedAt ? ` · answered ${formatDate(q.respondedAt, true)}` : ""}
                </p>
              ) : null}
            </Card>
          )}
        </div>

        <aside>
          <Card title="Actions">
            <QuotationActions id={q.id} status={q.status} canManage={canManage} canSend={can(user, "quote:send")} hasEmail={Boolean(q.email)} />
          </Card>
        </aside>
      </div>
    </>
  );
}
