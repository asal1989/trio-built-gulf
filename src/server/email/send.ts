import "server-only";

/**
 * Transactional email through Resend's REST API (no SDK needed).
 * Without RESEND_API_KEY (local development) messages are logged instead of sent.
 */
export type Attachment = { filename: string; content: Buffer };

export type EmailMessage = {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
};

export const FROM = {
  sales: process.env.EMAIL_FROM_SALES ?? "Trio Built Gulf <sales@triobuiltgulf.ae>",
  info: process.env.EMAIL_FROM_INFO ?? "Trio Built Gulf <info@triobuiltgulf.ae>",
};

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = Array.isArray(msg.to) ? msg.to : [msg.to];

  if (!key) {
    console.info(`[email:dev] to=${to.join(",")} subject="${msg.subject}" (set RESEND_API_KEY to send)`);
    return { ok: true, id: "dev-log" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: msg.from ?? FROM.info,
        to,
        reply_to: msg.replyTo,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        attachments: msg.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
        })),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      console.error("Resend error", res.status, json);
      return { ok: false, error: json.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, id: json.id };
  } catch (error) {
    console.error("Resend request failed", error);
    return { ok: false, error: "Email service unreachable" };
  }
}
