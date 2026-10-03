import "server-only";

/**
 * Branded transactional email templates. All dynamic values are HTML-escaped —
 * enquiry text comes from the public internet.
 */

const esc = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const NAVY = "#0a2e50";
const NAVY_DEEP = "#04121f";
const TEAL = "#348171";
const GOLD = "#e0b04a";

const siteUrl = () => process.env.SITE_URL ?? "https://triobuiltgulf.ae";

function layout(opts: { preheader: string; heading: string; body: string; cta?: { label: string; href: string } }) {
  return `<!doctype html><html><body style="margin:0;background:#f5f7f8;font-family:Arial,Helvetica,sans-serif;color:#1b2430">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:${NAVY_DEEP};padding:22px 28px;border-bottom:3px solid ${GOLD}">
  <div style="color:#fff;font-weight:800;letter-spacing:2px;font-size:16px">TRIO BUILT GULF</div>
  <div style="color:${TEAL};font-size:10px;letter-spacing:3px;margin-top:3px">TECHNICAL SERVICES LLC</div>
</td></tr>
<tr><td style="padding:30px 28px 8px">
  <h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:${NAVY}">${esc(opts.heading)}</h1>
  <div style="font-size:15px;line-height:1.6;color:#33404f">${opts.body}</div>
</td></tr>
${
  opts.cta
    ? `<tr><td style="padding:12px 28px 28px"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:${TEAL};color:#fff;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;padding:13px 22px;border-radius:8px">${esc(opts.cta.label)}</a></td></tr>`
    : `<tr><td style="height:20px"></td></tr>`
}
<tr><td style="background:${NAVY_DEEP};padding:18px 28px;color:#9fb0c0;font-size:12px;line-height:1.6">
  Trio Built Gulf Technical Services LLC · Dubai, UAE<br>
  <a href="${esc(siteUrl())}" style="color:${GOLD};text-decoration:none">${esc(siteUrl().replace(/^https?:\/\//, ""))}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

const row = (label: string, value: string | null | undefined) =>
  value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7785;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td><td style="padding:6px 0;font-size:14px;color:#1b2430">${esc(value)}</td></tr>`
    : "";

export type EnquiryView = {
  number: number;
  name: string;
  company?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  service?: string | null;
  projectType?: string | null;
  location?: string | null;
  area?: string | null;
  expectedStart?: string | null;
  budget?: string | null;
  message?: string | null;
  attachmentCount?: number;
};

export const leadCode = (n: number) => `L-${String(n).padStart(6, "0")}`;

/** To admin / assigned sales user when a website enquiry arrives. */
export function newEnquiryEmail(e: EnquiryView, adminUrl: string) {
  const rows =
    row("Name", e.name) +
    row("Company", e.company) +
    row("Phone", e.phone) +
    row("WhatsApp", e.whatsapp) +
    row("Email", e.email) +
    row("Service", e.service) +
    row("Project type", e.projectType) +
    row("Location", e.location) +
    row("Approx. area", e.area) +
    row("Expected start", e.expectedStart) +
    row("Budget", e.budget) +
    (e.attachmentCount ? row("Attachments", `${e.attachmentCount} file(s)`) : "");
  return {
    subject: `New enquiry ${leadCode(e.number)} — ${e.name}${e.service ? ` (${e.service})` : ""}`,
    html: layout({
      preheader: `${e.name} sent a new enquiry`,
      heading: `New website enquiry ${leadCode(e.number)}`,
      body: `<table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>${
        e.message
          ? `<p style="margin:16px 0 0;padding:12px 14px;background:#f5f7f8;border-left:3px solid ${GOLD};white-space:pre-wrap">${esc(e.message)}</p>`
          : ""
      }`,
      cta: { label: "Open enquiry", href: adminUrl },
    }),
  };
}

/** To the customer: enquiry received (also used for plain contact-form messages). */
export function enquiryAcknowledgementEmail(e: { name: string; number: number; service?: string | null }, phone: string) {
  return {
    subject: `We received your enquiry — Trio Built Gulf (${leadCode(e.number)})`,
    html: layout({
      preheader: "Thank you for contacting Trio Built Gulf Technical Services",
      heading: `Thank you, ${e.name.split(" ")[0]}`,
      body: `<p style="margin:0 0 12px">We have received your enquiry${e.service ? ` about <strong>${esc(e.service)}</strong>` : ""} and a member of our Dubai team will contact you shortly.</p>
<p style="margin:0 0 12px">Your reference is <strong>${leadCode(e.number)}</strong>. If your requirement is urgent, call or WhatsApp us on <strong>${esc(phone)}</strong>.</p>
<p style="margin:0;color:#6b7785;font-size:13px">This is an automatic acknowledgement — you do not need to reply.</p>`,
      cta: { label: "Visit our website", href: siteUrl() },
    }),
  };
}

export function followUpReminderEmail(opts: {
  leadNumber: number;
  customer: string;
  dueAt: string;
  note?: string | null;
  adminUrl: string;
}) {
  return {
    subject: `Follow-up due: ${leadCode(opts.leadNumber)} — ${opts.customer}`,
    html: layout({
      preheader: `Follow-up due ${opts.dueAt}`,
      heading: "Follow-up reminder",
      body: `<p style="margin:0 0 10px">A follow-up for <strong>${esc(opts.customer)}</strong> (${leadCode(opts.leadNumber)}) is due <strong>${esc(opts.dueAt)}</strong>.</p>${
        opts.note
          ? `<p style="margin:0;padding:10px 14px;background:#f5f7f8;border-left:3px solid ${GOLD}">${esc(opts.note)}</p>`
          : ""
      }`,
      cta: { label: "Open enquiry", href: opts.adminUrl },
    }),
  };
}

export function quotationSentEmail(
  q: { customer: string; number: string; total: string; validUntil?: string | null; project?: string | null },
  phone: string,
) {
  return {
    subject: `Quotation ${q.number} — Trio Built Gulf Technical Services`,
    html: layout({
      preheader: `Your quotation ${q.number}`,
      heading: `Quotation ${q.number}`,
      body: `<p style="margin:0 0 12px">Dear ${esc(q.customer)},</p>
<p style="margin:0 0 12px">Thank you for the opportunity. Please find our quotation${q.project ? ` for <strong>${esc(q.project)}</strong>` : ""} attached as a PDF.</p>
<table role="presentation" cellpadding="0" cellspacing="0">${row("Quotation", q.number)}${row("Total (incl. VAT)", q.total)}${row("Valid until", q.validUntil)}</table>
<p style="margin:14px 0 0">Reply to this email or call <strong>${esc(phone)}</strong> with any questions or to confirm.</p>`,
    }),
  };
}

export function quotationDecisionEmail(q: {
  number: string;
  customer: string;
  status: "ACCEPTED" | "REJECTED";
  adminUrl: string;
}) {
  return {
    subject: `Quotation ${q.number} ${q.status === "ACCEPTED" ? "accepted" : "rejected"} — ${q.customer}`,
    html: layout({
      preheader: `${q.number} ${q.status.toLowerCase()}`,
      heading: `Quotation ${q.status === "ACCEPTED" ? "accepted" : "rejected"}`,
      body: `<p style="margin:0">${esc(q.customer)} — quotation <strong>${esc(q.number)}</strong> was marked <strong>${q.status.toLowerCase()}</strong>.</p>`,
      cta: { label: "Open quotation", href: q.adminUrl },
    }),
  };
}

/** Admin invitation / password notice. */
export function accountEmail(opts: { name: string; loginUrl: string; note: string }) {
  return {
    subject: "Your Trio Built Gulf admin account",
    html: layout({
      preheader: "Admin access",
      heading: `Hello ${opts.name}`,
      body: `<p style="margin:0">${esc(opts.note)}</p>`,
      cta: { label: "Sign in", href: opts.loginUrl },
    }),
  };
}
