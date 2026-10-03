"use client";

import { useState, useTransition } from "react";
import {
  addNote,
  assignLead,
  completeFollowUp,
  logContact,
  scheduleFollowUp,
  setLeadStatus,
  updateLeadDetails,
} from "@/app/admin/(panel)/leads/actions";
import { BUDGET_RANGES, LEAD_STATUS_LABELS, LEAD_STATUS_ORDER, PROJECT_TYPES } from "@/lib/enquiry-options";
import { ActionForm, Field, Modal, SubmitButton, useToast } from "./forms";
import { waDigits } from "./lead-ui";
import { button, inputCls } from "./ui";

/* ---------------------------- status ----------------------------------- */

export function StatusForm({ id, status, canEdit }: { id: string; status: keyof typeof LEAD_STATUS_LABELS; canEdit: boolean }) {
  const [next, setNext] = useState(status);
  if (!canEdit) return null;
  return (
    <ActionForm action={setLeadStatus} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Pipeline stage">
        <select name="status" value={next} onChange={(e) => setNext(e.target.value as typeof status)} className={inputCls}>
          {LEAD_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>
      {next === "LOST" ? (
        <Field label="Reason lost (optional)">
          <input name="lostReason" maxLength={300} className={inputCls} placeholder="Price, timing, went elsewhere…" />
        </Field>
      ) : null}
      {next === "WON" ? (
        <Field label="Won value, AED (optional)">
          <input name="wonValue" inputMode="decimal" className={inputCls} placeholder="e.g. 45000" />
        </Field>
      ) : null}
      <SubmitButton variant="primary" small>
        Update status
      </SubmitButton>
    </ActionForm>
  );
}

/* --------------------------- assignment -------------------------------- */

export function AssignForm({
  id,
  assigneeId,
  staff,
  canAssign,
}: {
  id: string;
  assigneeId: string | null;
  staff: { id: string; name: string }[];
  canAssign: boolean;
}) {
  return (
    <ActionForm action={assignLead} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Assigned to">
        <select name="assigneeId" defaultValue={assigneeId ?? ""} disabled={!canAssign} className={inputCls}>
          <option value="">Unassigned</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </Field>
      {canAssign ? (
        <SubmitButton variant="secondary" small>
          Save assignment
        </SubmitButton>
      ) : null}
    </ActionForm>
  );
}

/* ---------------------------- follow-ups ------------------------------- */

/** Default: tomorrow 10:00 Dubai time, formatted for datetime-local. */
function tomorrowTen(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000 + 4 * 3600 * 1000);
  return `${d.toISOString().slice(0, 10)}T10:00`;
}

export function FollowUpForm({ id }: { id: string }) {
  return (
    <ActionForm action={scheduleFollowUp} resetOnSuccess className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Schedule follow-up (Dubai time)">
        <input type="datetime-local" name="dueAt" required defaultValue={tomorrowTen()} className={inputCls} />
      </Field>
      <Field label="Note (optional)">
        <input name="note" maxLength={500} className={inputCls} placeholder="What to follow up on" />
      </Field>
      <SubmitButton variant="teal" small>
        Schedule
      </SubmitButton>
    </ActionForm>
  );
}

export function CompleteFollowUp({ followUpId }: { followUpId: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const fd = new FormData();
          fd.set("followUpId", followUpId);
          const res = await completeFollowUp(undefined, fd);
          toast(res.error ? "error" : "success", res.error ?? res.ok ?? "Done");
        })
      }
      className="text-xs font-semibold text-teal-700 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Mark done"}
    </button>
  );
}

/* ------------------------------ notes ---------------------------------- */

export function NoteForm({ id }: { id: string }) {
  return (
    <ActionForm action={addNote} resetOnSuccess className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="body"
        required
        rows={3}
        maxLength={4000}
        placeholder="Add an internal note — only your team can see this."
        className={inputCls}
        aria-label="Internal note"
      />
      <SubmitButton variant="primary" small pendingText="Adding…">
        Add note
      </SubmitButton>
    </ActionForm>
  );
}

/* -------------------------- contact actions ---------------------------- */

/** Call / WhatsApp / Email links that also log the contact in the activity history. */
export function ContactActions({
  id,
  name,
  phone,
  whatsapp,
  email,
  canLog,
}: {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  canLog: boolean;
}) {
  const [, start] = useTransition();
  const log = (channel: "CALL" | "EMAIL" | "WHATSAPP") => {
    if (!canLog) return;
    start(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("channel", channel);
      await logContact(undefined, fd);
    });
  };
  const wa = waDigits(whatsapp ?? phone);
  const greeting = encodeURIComponent(`Hello ${name.split(" ")[0]}, this is Trio Built Gulf Technical Services regarding your enquiry.`);

  return (
    <div className="flex flex-wrap gap-2">
      {phone ? (
        <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} onClick={() => log("CALL")} className={button("secondary", true)}>
          📞 Call
        </a>
      ) : null}
      {wa ? (
        <a href={`https://wa.me/${wa}?text=${greeting}`} target="_blank" rel="noopener noreferrer" onClick={() => log("WHATSAPP")} className={button("secondary", true)}>
          💬 WhatsApp
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}?subject=${encodeURIComponent("Your enquiry — Trio Built Gulf")}`} onClick={() => log("EMAIL")} className={button("secondary", true)}>
          ✉️ Email
        </a>
      ) : null}
    </div>
  );
}

/* ------------------------------ edit modal ----------------------------- */

export type LeadDetails = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  serviceLabel: string | null;
  projectType: string | null;
  location: string | null;
  area: string | null;
  expectedStart: string | null; // yyyy-mm-dd
  budget: string | null;
  message: string | null;
  type: "QUOTE" | "MAINTENANCE" | "GENERAL";
};

export function EditLeadModal({ lead, services }: { lead: LeadDetails; services: string[] }) {
  return (
    <Modal trigger="Edit details" title={`Edit ${lead.name}`} wide>
      {(close) => (
        <ActionForm action={updateLeadDetails} onSuccess={close} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={lead.id} />
          <Field label="Name">
            <input name="name" required defaultValue={lead.name} className={inputCls} />
          </Field>
          <Field label="Company">
            <input name="company" defaultValue={lead.company ?? ""} className={inputCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={lead.email ?? ""} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={lead.phone ?? ""} className={inputCls} />
          </Field>
          <Field label="WhatsApp">
            <input name="whatsapp" defaultValue={lead.whatsapp ?? ""} className={inputCls} />
          </Field>
          <Field label="Type">
            <select name="type" defaultValue={lead.type} className={inputCls}>
              <option value="QUOTE">Quote request</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="GENERAL">General</option>
            </select>
          </Field>
          <Field label="Service">
            <input name="serviceLabel" list="lead-services" defaultValue={lead.serviceLabel ?? ""} className={inputCls} />
            <datalist id="lead-services">
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Project type">
            <select name="projectType" defaultValue={lead.projectType ?? ""} className={inputCls}>
              <option value="">—</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={lead.location ?? ""} className={inputCls} />
          </Field>
          <Field label="Approx. area">
            <input name="area" defaultValue={lead.area ?? ""} className={inputCls} />
          </Field>
          <Field label="Expected start">
            <input name="expectedStart" type="date" defaultValue={lead.expectedStart ?? ""} className={inputCls} />
          </Field>
          <Field label="Budget">
            <select name="budget" defaultValue={lead.budget ?? ""} className={inputCls}>
              <option value="">—</option>
              {BUDGET_RANGES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              {lead.budget && !(BUDGET_RANGES as readonly string[]).includes(lead.budget) ? <option value={lead.budget}>{lead.budget}</option> : null}
            </select>
          </Field>
          <Field label="Message" className="sm:col-span-2">
            <textarea name="message" rows={4} defaultValue={lead.message ?? ""} className={inputCls} />
          </Field>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={close} className={button("secondary", true)}>
              Cancel
            </button>
            <SubmitButton variant="teal" small>
              Save changes
            </SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}
