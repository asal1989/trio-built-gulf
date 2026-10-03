"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createQuotation, updateQuotation } from "@/app/admin/(panel)/quotations/actions";
import { computeTotals } from "@/server/quotations/calc";
import { ActionForm, Field, SubmitButton } from "./forms";
import { button, Card, inputCls } from "./ui";

export type EditorQuote = {
  id?: string;
  leadId?: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  projectName: string;
  projectLocation: string;
  description: string;
  taxRate: number;
  discount: number;
  terms: string;
  validUntil: string; // yyyy-mm-dd
  items: { description: string; quantity: number; unit: string; unitPrice: number }[];
};

const UNITS = ["nos", "m²", "m", "lm", "set", "lot", "hrs", "days", "month", "year"];

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function QuotationEditor({ initial }: { initial: EditorQuote }) {
  const router = useRouter();
  const [items, setItems] = useState(initial.items.length ? initial.items : [{ description: "", quantity: 1, unit: "nos", unitPrice: 0 }]);
  const [discount, setDiscount] = useState(initial.discount);
  const [taxRate, setTaxRate] = useState(initial.taxRate);

  const totals = useMemo(() => computeTotals(items, discount, taxRate), [items, discount, taxRate]);

  const setItem = (i: number, patch: Partial<(typeof items)[number]>) =>
    setItems((cur) => cur.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const editing = Boolean(initial.id);

  return (
    <ActionForm
      action={editing ? updateQuotation : createQuotation}
      onSuccess={(s) => {
        if (!editing && s.id) router.push(`/admin/quotations/${s.id}/`);
        else router.refresh();
      }}
      className="space-y-5"
    >
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {initial.leadId ? <input type="hidden" name="leadId" value={initial.leadId} /> : null}

      <Card title="Customer">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name *">
            <input name="customerName" required defaultValue={initial.customerName} className={inputCls} />
          </Field>
          <Field label="Company">
            <input name="companyName" defaultValue={initial.companyName} className={inputCls} />
          </Field>
          <Field label="Email (needed to send)">
            <input name="email" type="email" defaultValue={initial.email} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={initial.phone} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Project">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name">
            <input name="projectName" defaultValue={initial.projectName} className={inputCls} />
          </Field>
          <Field label="Location">
            <input name="projectLocation" defaultValue={initial.projectLocation} className={inputCls} />
          </Field>
          <Field label="Scope / description" className="sm:col-span-2">
            <textarea name="description" rows={3} defaultValue={initial.description} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Line items" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-mist/70 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-navy/55">
                <th className="w-10 px-3 py-2">#</th>
                <th className="px-3 py-2">Description</th>
                <th className="w-24 px-3 py-2">Qty</th>
                <th className="w-24 px-3 py-2">Unit</th>
                <th className="w-32 px-3 py-2">Unit price</th>
                <th className="w-32 px-3 py-2 text-right">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-line/70 align-top">
                  <td className="px-3 py-2 text-navy/50">{i + 1}</td>
                  <td className="px-3 py-2">
                    <textarea
                      name="item_description"
                      rows={2}
                      value={it.description}
                      onChange={(e) => setItem(i, { description: e.target.value })}
                      placeholder="e.g. Supply and install false ceiling…"
                      className={inputCls}
                      aria-label={`Item ${i + 1} description`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="item_quantity"
                      type="number"
                      min="0"
                      step="any"
                      value={it.quantity}
                      onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                      className={inputCls}
                      aria-label={`Item ${i + 1} quantity`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select name="item_unit" value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })} className={inputCls} aria-label={`Item ${i + 1} unit`}>
                      {[...new Set([it.unit, ...UNITS])].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="item_unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.unitPrice}
                      onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
                      className={inputCls}
                      aria-label={`Item ${i + 1} unit price`}
                    />
                  </td>
                  <td className="px-3 py-2 pt-4 text-right font-semibold tabular-nums text-navy">{fmt(totals.lines[i] ?? 0)}</td>
                  <td className="px-2 py-2 pt-3">
                    {items.length > 1 ? (
                      <button type="button" onClick={() => setItems((c) => c.filter((_, j) => j !== i))} aria-label={`Remove item ${i + 1}`} className="rounded p-1.5 text-red-600 hover:bg-red-50">
                        ✕
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <button type="button" onClick={() => setItems((c) => [...c, { description: "", quantity: 1, unit: "nos", unitPrice: 0 }])} className={button("secondary", true)}>
            + Add line
          </button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Card title="Terms & validity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valid until">
              <input name="validUntil" type="date" defaultValue={initial.validUntil} className={inputCls} />
            </Field>
            <div />
            <Field label="Terms & conditions" className="sm:col-span-2">
              <textarea name="terms" rows={7} defaultValue={initial.terms} className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Totals">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-navy/60">Subtotal</dt>
              <dd className="font-semibold tabular-nums">AED {fmt(totals.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-navy/60">Discount (AED)</dt>
              <dd>
                <input name="discount" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className={`${inputCls} !w-32 text-right`} aria-label="Discount" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-navy/60">VAT %</dt>
              <dd>
                <input name="taxRate" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className={`${inputCls} !w-32 text-right`} aria-label="VAT rate" />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy/60">VAT amount</dt>
              <dd className="tabular-nums">AED {fmt(totals.taxAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold text-navy">Total</dt>
              <dd className="font-extrabold tabular-nums text-navy">AED {fmt(totals.total)}</dd>
            </div>
          </dl>
          <SubmitButton variant="teal" className="mt-5 w-full">
            {editing ? "Save draft" : "Create draft"}
          </SubmitButton>
        </Card>
      </div>
    </ActionForm>
  );
}
