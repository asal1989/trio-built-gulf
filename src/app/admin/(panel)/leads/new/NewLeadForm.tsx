"use client";

import { useRouter } from "next/navigation";
import { createLeadManually } from "../actions";
import { ActionForm, Field, SubmitButton } from "@/components/admin/forms";
import { Card, inputCls } from "@/components/admin/ui";
import { BUDGET_RANGES, PROJECT_TYPES } from "@/lib/enquiry-options";

export default function NewLeadForm({ services }: { services: string[] }) {
  const router = useRouter();
  return (
    <ActionForm action={createLeadManually} onSuccess={(s) => s.id && router.push(`/admin/leads/${s.id}/`)} successMessage="Lead created.">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name *">
            <input name="name" required autoFocus className={inputCls} />
          </Field>
          <Field label="Company">
            <input name="company" className={inputCls} />
          </Field>
          <Field label="Phone">
            <input name="phone" className={inputCls} />
          </Field>
          <Field label="WhatsApp">
            <input name="whatsapp" className={inputCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={inputCls} />
          </Field>
          <Field label="Source">
            <select name="source" className={inputCls} defaultValue="phone">
              {["phone", "whatsapp", "email", "walk-in", "referral", "other"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service">
            <input name="serviceLabel" list="svc" className={inputCls} />
            <datalist id="svc">
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Type">
            <select name="type" className={inputCls} defaultValue="QUOTE">
              <option value="QUOTE">Quote request</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="GENERAL">General</option>
            </select>
          </Field>
          <Field label="Project type">
            <select name="projectType" className={inputCls} defaultValue="">
              <option value="">—</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input name="location" className={inputCls} />
          </Field>
          <Field label="Approx. area">
            <input name="area" className={inputCls} />
          </Field>
          <Field label="Expected start">
            <input name="expectedStart" type="date" className={inputCls} />
          </Field>
          <Field label="Budget">
            <select name="budget" className={inputCls} defaultValue="">
              <option value="">—</option>
              {BUDGET_RANGES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes / message" className="sm:col-span-2">
            <textarea name="message" rows={4} className={inputCls} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <SubmitButton variant="teal">Create lead</SubmitButton>
        </div>
      </Card>
    </ActionForm>
  );
}
