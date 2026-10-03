"use client";

import { saveContactSettings, saveCrmSettings } from "@/app/admin/(panel)/settings/actions";
import type { ContactSettings, CrmSettings } from "@/server/settings";
import { ActionForm, Field, SubmitButton } from "./forms";
import { ObjectListField } from "./ListFields";
import { Card, inputCls } from "./ui";

export function ContactSettingsForm({ initial }: { initial: ContactSettings }) {
  return (
    <ActionForm action={saveContactSettings} className="space-y-5">
      <Card title="Company">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name">
            <input name="companyName" defaultValue={initial.companyName} required className={inputCls} />
          </Field>
          <Field label="Legal name">
            <input name="legalName" defaultValue={initial.legalName} required className={inputCls} />
          </Field>
          <Field label="Email *" hint="Shown on the website. Enquiry notifications are configured under CRM settings.">
            <input name="email" type="email" defaultValue={initial.email} required className={inputCls} />
          </Field>
          <Field label="Primary WhatsApp number *" hint="Digits with country code, e.g. 971525073289. Used by every WhatsApp button.">
            <input name="whatsapp" defaultValue={initial.whatsapp} required inputMode="numeric" className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Phone numbers">
        <ObjectListField
          name="phones"
          label="Phones (first one is the main number)"
          values={initial.phones}
          fields={[
            { key: "label", label: "Label", placeholder: "Operations" },
            { key: "number", label: "Number to display", placeholder: "+971 52 507 3289" },
            { key: "whatsapp", label: "WhatsApp (digits)", placeholder: "971525073289" },
            { key: "role", label: "Role shown next to it", placeholder: "Co-Founder" },
          ]}
          addLabel="Add number"
        />
      </Card>

      <Card title="Address & map">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street address" className="sm:col-span-2" hint="Also used in Google structured data. Leave blank if you do not want to publish a street address.">
            <input name="address" defaultValue={initial.address} className={inputCls} />
          </Field>
          <Field label="City">
            <input name="city" defaultValue={initial.city} className={inputCls} />
          </Field>
          <Field label="Country">
            <input name="country" defaultValue={initial.country} className={inputCls} />
          </Field>
          <Field label="Google Maps embed URL" className="sm:col-span-2" hint='In Google Maps choose Share → Embed a map and paste the link from src="…".'>
            <input name="mapsUrl" defaultValue={initial.mapsUrl} className={inputCls} placeholder="https://www.google.com/maps/embed?pb=…" />
          </Field>
          <Field label="Business hours" className="sm:col-span-2">
            <input name="hours" defaultValue={initial.hours} className={inputCls} placeholder="Sat – Thu, 8:00 – 18:00" />
          </Field>
        </div>
      </Card>

      <Card title="Social media">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["linkedin", "instagram", "facebook", "x", "youtube"] as const).map((k) => (
            <Field key={k} label={k === "x" ? "X (Twitter)" : k.charAt(0).toUpperCase() + k.slice(1)}>
              <input name={k} defaultValue={initial.social[k]} className={inputCls} placeholder="https://" />
            </Field>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-xl border border-line bg-white/95 p-2 shadow-lg backdrop-blur">
          <SubmitButton variant="teal">Save contact settings</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}

export function CrmSettingsForm({ initial, staff }: { initial: CrmSettings; staff: { id: string; name: string }[] }) {
  return (
    <ActionForm action={saveCrmSettings} className="space-y-5">
      <Card title="Enquiry handling">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assign new website enquiries to" hint="Leave unassigned to triage manually.">
            <select name="defaultAssigneeId" defaultValue={initial.defaultAssigneeId} className={inputCls}>
              <option value="">Nobody (unassigned)</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Email new enquiries to" hint="One or more addresses separated by commas. Defaults to the company email.">
            <input name="notifyEmails" defaultValue={initial.notifyEmails.join(", ")} className={inputCls} placeholder="sales@triobuiltgulf.ae" />
          </Field>
        </div>
      </Card>

      <Card title="Quotations">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Default VAT %">
            <input name="vatRate" type="number" step="0.01" min="0" max="100" defaultValue={initial.vatRate} className={inputCls} />
          </Field>
          <Field label="Valid for (days)">
            <input name="quoteValidityDays" type="number" min="1" max="365" defaultValue={initial.quoteValidityDays} className={inputCls} />
          </Field>
          <Field label="Company TRN" hint="Printed on quotations if set.">
            <input name="trn" defaultValue={initial.trn} className={inputCls} />
          </Field>
          <Field label="Default terms & conditions" className="sm:col-span-3">
            <textarea name="quoteTerms" rows={7} defaultValue={initial.quoteTerms} className={inputCls} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <SubmitButton variant="teal">Save CRM settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
