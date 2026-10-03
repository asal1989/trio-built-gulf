/**
 * Quotation maths, done in integer fils (1 AED = 100 fils) so totals never
 * pick up floating-point noise. Shared by the editor preview and the server,
 * which always recomputes before saving.
 */
export type ItemInput = { description: string; quantity: number; unit: string; unitPrice: number };

export type Totals = {
  lines: number[]; // line totals in AED
  subtotal: number;
  discount: number;
  taxable: number;
  taxAmount: number;
  total: number;
};

const toFils = (n: number) => Math.round(n * 100);
const fromFils = (n: number) => n / 100;

export function computeTotals(items: ItemInput[], discountAed: number, taxRatePercent: number): Totals {
  const lineFils = items.map((i) => Math.round(toFils(i.unitPrice) * i.quantity));
  const subtotal = lineFils.reduce((a, b) => a + b, 0);
  const discount = Math.min(Math.max(toFils(discountAed), 0), subtotal);
  const taxable = subtotal - discount;
  const taxAmount = Math.round((taxable * taxRatePercent) / 100);
  return {
    lines: lineFils.map(fromFils),
    subtotal: fromFils(subtotal),
    discount: fromFils(discount),
    taxable: fromFils(taxable),
    taxAmount: fromFils(taxAmount),
    total: fromFils(taxable + taxAmount),
  };
}

export const quoteNumber = (year: number, seq: number) => `QT-${year}-${String(seq).padStart(4, "0")}`;
