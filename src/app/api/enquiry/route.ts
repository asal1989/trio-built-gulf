import { after } from "next/server";
import { audit } from "@/server/audit";
import { sendEmail, FROM } from "@/server/email/send";
import { enquiryAcknowledgementEmail, leadCode, newEnquiryEmail } from "@/server/email/templates";
import { createLeadFromSubmission, EnquirySchema, type ValidatedFile } from "@/server/leads/submit";
import { rateLimit } from "@/server/ratelimit";
import { assertSameOrigin, clientInfo } from "@/server/request";
import { PUBLIC_ENQUIRY_RULES, validateUpload } from "@/server/uploads";
import { ENQUIRY_LIMITS } from "@/lib/enquiry-options";

// Uploads need the Node.js runtime (Buffer, S3 SDK, Prisma).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const MAX_BODY = ENQUIRY_LIMITS.maxTotalBytes + 512 * 1024;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (res) {
    return res as Response;
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return json({ ok: false, message: "Your files are too large (25 MB total limit)." }, 413);

  const { ip, userAgent } = await clientInfo();
  const limit = await rateLimit(`enquiry:${ip ?? "unknown"}`, 6, 10 * 60);
  if (!limit.allowed) {
    return json({ ok: false, message: "Too many enquiries from your connection. Please try again in a few minutes." }, 429);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: "We could not read your submission. Please try again." }, 400);
  }

  // Honeypot: humans never see this field. Pretend success so bots learn nothing.
  if (String(form.get("website") ?? "").trim() !== "") return json({ ok: true, reference: "L-000000" });

  const raw: Record<string, string> = {};
  for (const key of ["name", "company", "email", "phone", "whatsapp", "service", "projectType", "location", "area", "startDate", "budget", "message"]) {
    const v = form.get(key);
    if (typeof v === "string") raw[key] = v;
  }

  const parsed = EnquirySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      errors[k] ??= issue.message;
    }
    return json({ ok: false, errors, message: "Please check the highlighted fields." }, 422);
  }

  // Files: validate type by content, size and count — on the server, always.
  const incoming = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (incoming.length > ENQUIRY_LIMITS.maxFiles)
    return json({ ok: false, errors: { files: `Attach at most ${ENQUIRY_LIMITS.maxFiles} files.` }, message: "Too many files." }, 422);
  if (incoming.reduce((n, f) => n + f.size, 0) > ENQUIRY_LIMITS.maxTotalBytes)
    return json({ ok: false, errors: { files: "Files are larger than 25 MB in total." }, message: "Files too large." }, 422);

  const files: ValidatedFile[] = [];
  for (const f of incoming) {
    const result = await validateUpload(f, PUBLIC_ENQUIRY_RULES);
    if (!result.ok) return json({ ok: false, errors: { files: result.error }, message: result.error }, 422);
    files.push({ name: result.name, buffer: result.buffer, detected: result.detected });
  }

  let lead;
  try {
    lead = await createLeadFromSubmission(parsed.data, files, { ip, userAgent });
  } catch (error) {
    console.error("enquiry: could not save", error);
    return json({ ok: false, message: "We could not save your enquiry right now. Please call or WhatsApp us instead." }, 500);
  }

  await audit({ action: "CREATE", entity: "Lead", entityId: lead.id, summary: `Website enquiry ${leadCode(lead.number)} from ${parsed.data.name}` });

  // Emails go out after the response so the visitor is never kept waiting.
  after(async () => {
    const siteUrl = process.env.SITE_URL ?? "https://triobuiltgulf.ae";
    const view = {
      number: lead.number,
      name: parsed.data.name,
      company: parsed.data.company,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      service: parsed.data.service,
      projectType: parsed.data.projectType,
      location: parsed.data.location,
      area: parsed.data.area,
      expectedStart: parsed.data.startDate,
      budget: parsed.data.budget,
      message: parsed.data.message,
      attachmentCount: lead.attachmentCount,
    };
    const admin = newEnquiryEmail(view, `${siteUrl}/admin/leads/${lead.id}/`);
    const recipients = [...new Set([...lead.notifyEmails, ...(lead.assigneeEmail ? [lead.assigneeEmail] : [])])];
    await sendEmail({ to: recipients, from: FROM.sales, replyTo: parsed.data.email, ...admin });

    const ack = enquiryAcknowledgementEmail({ name: parsed.data.name, number: lead.number, service: parsed.data.service }, lead.contactPhone);
    await sendEmail({ to: parsed.data.email, from: FROM.info, ...ack });
  });

  return json({ ok: true, reference: leadCode(lead.number) });
}
