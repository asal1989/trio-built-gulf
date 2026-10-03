import "server-only";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { ContactSettings, CrmSettings } from "../settings";

/**
 * Professional A4 quotation PDF, generated server-side with pdfkit.
 * Uses only the built-in Helvetica fonts, so no font files are needed.
 */

export type QuotePdfData = {
  number: string;
  status: string;
  createdAt: Date;
  validUntil: Date | null;
  customerName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  projectName: string | null;
  projectLocation: string | null;
  description: string | null;
  currency: string;
  taxRate: number;
  items: { description: string; quantity: number; unit: string; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  terms: string | null;
};

const NAVY = "#0a2e50";
const NAVY_DEEP = "#04121f";
const TEAL = "#348171";
const GOLD = "#e0b04a";
const INK = "#1b2430";
const MUTE = "#6b7785";
const LINE = "#dfe5e9";

const money = (n: number, cur: string) =>
  `${cur} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Dubai" }) : "—";

export function renderQuotationPdf(
  q: QuotePdfData,
  contact: ContactSettings,
  crm: Pick<CrmSettings, "trn">,
): Promise<Buffer> {
  // Browsers submit textarea line breaks as CRLF; pdfkit would print the CR as a stray glyph.
  const lf = (v: string | null) => (v ? v.replace(/\r\n?/g, "\n") : v);
  q = {
    ...q,
    description: lf(q.description),
    terms: lf(q.terms),
    projectName: lf(q.projectName),
    items: q.items.map((i) => ({ ...i, description: lf(i.description) as string })),
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      bufferPages: true,
      margins: { top: 40, bottom: 60, left: 44, right: 44 },
      info: { Title: `Quotation ${q.number}`, Author: contact.legalName, Subject: q.projectName ?? "Quotation" },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const L = doc.page.margins.left;
    const R = W - doc.page.margins.right;
    const content = R - L;

    /* ---- header band ---- */
    doc.rect(0, 0, W, 112).fill(NAVY_DEEP);
    doc.rect(0, 112, W, 3).fill(GOLD);
    const logo = path.join(process.cwd(), "public", "images", "logo-full-light.c79eecc0.png");
    if (fs.existsSync(logo)) doc.image(logo, L, 16, { height: 80 });
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("QUOTATION", L, 30, { width: content, align: "right" });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#9fb0c0")
      .text(q.number, L, 58, { width: content, align: "right" })
      .text(`Date: ${date(q.createdAt)}`, L, 72, { width: content, align: "right" })
      .text(`Valid until: ${date(q.validUntil)}`, L, 86, { width: content, align: "right" });

    /* ---- parties ---- */
    let y = 136;
    doc.fillColor(MUTE).font("Helvetica-Bold").fontSize(8).text("FROM", L, y).text("QUOTATION FOR", L + content / 2 + 10, y);
    y += 14;
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(contact.legalName, L, y, { width: content / 2 - 10 });
    doc.font("Helvetica").fontSize(9).fillColor(MUTE);
    const fromLines = [
      contact.address || `${contact.city}, ${contact.country}`,
      contact.phones[0]?.number,
      contact.email,
      crm.trn ? `TRN: ${crm.trn}` : null,
    ].filter(Boolean) as string[];
    let fy = y + 16;
    for (const line of fromLines) {
      doc.text(line, L, fy, { width: content / 2 - 10 });
      fy += 12;
    }

    const cx = L + content / 2 + 10;
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text(q.customerName, cx, y, { width: content / 2 - 10 });
    doc.font("Helvetica").fontSize(9).fillColor(MUTE);
    let cy = y + 16;
    for (const line of [q.companyName, q.email, q.phone].filter(Boolean) as string[]) {
      doc.text(line, cx, cy, { width: content / 2 - 10 });
      cy += 12;
    }

    y = Math.max(fy, cy) + 14;

    if (q.projectName || q.projectLocation || q.description) {
      doc.roundedRect(L, y, content, 4, 2).fill(TEAL);
      y += 12;
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(q.projectName ?? "Project", L, y, { width: content });
      y = doc.y + 2;
      if (q.projectLocation) {
        doc.font("Helvetica").fontSize(9).fillColor(MUTE).text(q.projectLocation, L, y, { width: content });
        y = doc.y + 2;
      }
      if (q.description) {
        doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(q.description, L, y + 4, { width: content, lineGap: 2 });
        y = doc.y;
      }
      y += 14;
    }

    /* ---- items table ---- */
    const cols = {
      no: { x: L, w: 24 },
      desc: { x: L + 24, w: content - 24 - 56 - 44 - 76 - 84 },
      qty: { x: 0, w: 56 },
      unit: { x: 0, w: 44 },
      price: { x: 0, w: 76 },
      amount: { x: 0, w: 84 },
    };
    cols.qty.x = cols.desc.x + cols.desc.w;
    cols.unit.x = cols.qty.x + cols.qty.w;
    cols.price.x = cols.unit.x + cols.unit.w;
    cols.amount.x = cols.price.x + cols.price.w;

    const header = (yy: number) => {
      doc.rect(L, yy, content, 22).fill(NAVY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
      doc.text("#", cols.no.x + 6, yy + 7, { width: cols.no.w });
      doc.text("DESCRIPTION", cols.desc.x + 4, yy + 7, { width: cols.desc.w });
      doc.text("QTY", cols.qty.x, yy + 7, { width: cols.qty.w, align: "right" });
      doc.text("UNIT", cols.unit.x + 6, yy + 7, { width: cols.unit.w });
      doc.text("UNIT PRICE", cols.price.x, yy + 7, { width: cols.price.w, align: "right" });
      doc.text("AMOUNT", cols.amount.x, yy + 7, { width: cols.amount.w - 6, align: "right" });
      return yy + 22;
    };

    y = header(y);
    const bottomLimit = doc.page.height - 130;

    q.items.forEach((item, i) => {
      doc.font("Helvetica").fontSize(9.5);
      const h = Math.max(24, doc.heightOfString(item.description, { width: cols.desc.w - 8 }) + 12);
      if (y + h > bottomLimit) {
        doc.addPage();
        y = header(40);
      }
      if (i % 2 === 1) doc.rect(L, y, content, h).fill("#f5f7f8");
      doc.fillColor(MUTE).fontSize(9).text(String(i + 1), cols.no.x + 6, y + 7, { width: cols.no.w });
      doc.fillColor(INK).fontSize(9.5).text(item.description, cols.desc.x + 4, y + 7, { width: cols.desc.w - 8 });
      doc.text(item.quantity.toLocaleString("en-US", { maximumFractionDigits: 2 }), cols.qty.x, y + 7, { width: cols.qty.w, align: "right" });
      doc.fillColor(MUTE).text(item.unit, cols.unit.x + 6, y + 7, { width: cols.unit.w });
      doc.fillColor(INK).text(item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }), cols.price.x, y + 7, { width: cols.price.w, align: "right" });
      doc.text(item.lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 }), cols.amount.x, y + 7, { width: cols.amount.w - 6, align: "right" });
      doc.moveTo(L, y + h).lineTo(R, y + h).lineWidth(0.5).strokeColor(LINE).stroke();
      y += h;
    });

    /* ---- totals ---- */
    if (y + 110 > doc.page.height - 70) {
      doc.addPage();
      y = 50;
    }
    y += 12;
    const tx = cols.price.x - 20;
    const tw = R - tx;
    const row = (label: string, value: string, bold = false, fill?: string) => {
      if (fill) doc.rect(tx, y - 4, tw, 24).fill(fill);
      doc
        .fillColor(fill ? "#ffffff" : bold ? INK : MUTE)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 11 : 9.5)
        .text(label, tx + 8, y + (fill ? 2 : 0), { width: tw / 2 })
        .text(value, tx, y + (fill ? 2 : 0), { width: tw - 8, align: "right" });
      y += fill ? 28 : 18;
    };
    row("Subtotal", money(q.subtotal, q.currency));
    if (q.discount > 0) row("Discount", `- ${money(q.discount, q.currency)}`);
    row(`VAT (${q.taxRate.toLocaleString("en-US", { maximumFractionDigits: 2 })}%)`, money(q.taxAmount, q.currency));
    y += 4;
    row("TOTAL", money(q.total, q.currency), true, NAVY);

    /* ---- terms ---- */
    if (q.terms) {
      y += 8;
      if (y + 90 > doc.page.height - 70) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text("TERMS & CONDITIONS", L, y);
      y = doc.y + 4;
      doc.fillColor(MUTE).font("Helvetica").fontSize(8.5).text(q.terms, L, y, { width: content, lineGap: 2 });
    }

    /* ---- footer + page numbers on every page ---- */
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0; // stop pdfkit auto-paginating when we draw in the footer zone
      const fy2 = doc.page.height - 44;
      doc.moveTo(L, fy2 - 8).lineTo(R, fy2 - 8).lineWidth(0.7).strokeColor(GOLD).stroke();
      doc
        .fillColor(MUTE)
        .font("Helvetica")
        .fontSize(8)
        .text(`${contact.legalName}  ·  ${contact.address || contact.city + ", " + contact.country}`, L, fy2, { width: content, align: "center", lineBreak: false })
        .text(`${contact.email}  ·  ${contact.phones[0]?.number ?? ""}  ·  triobuiltgulf.ae`, L, fy2 + 11, { width: content, align: "center", lineBreak: false })
        .text(`Page ${i - range.start + 1} of ${range.count}`, L, fy2 + 22, { width: content, align: "center", lineBreak: false });
    }

    doc.end();
  });
}
