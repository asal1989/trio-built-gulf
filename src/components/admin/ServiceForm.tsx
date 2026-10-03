"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveService } from "@/app/admin/(panel)/services/actions";
import { ICON_NAMES } from "@/components/Icon";
import { ActionForm, Field, SubmitButton } from "./forms";
import { ObjectListField, StringListField } from "./ListFields";
import { MediaField, MediaGalleryField, type PickedMedia } from "./MediaPicker";
import { Card, inputCls } from "./ui";

export type ServiceFormData = {
  id?: string;
  name: string;
  label: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  headingLead: string;
  headingAccent: string;
  icon: string;
  cover: PickedMedia | null;
  gallery: PickedMedia[];
  features: string[];
  intro: string[];
  scope: { title: string; text: string }[];
  whenTitle: string;
  whenItems: string[];
  approach: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
  whatsappMessage: string;
  seoTitle: string;
  seoDescription: string;
  order: number;
  published: boolean;
};

export default function ServiceForm({ initial, others }: { initial: ServiceFormData; others: { slug: string; label: string }[] }) {
  const router = useRouter();
  const [related, setRelated] = useState<string[]>(initial.related);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDesc, setSeoDesc] = useState(initial.seoDescription);

  return (
    <ActionForm
      action={saveService}
      onSuccess={(s) => {
        if (!initial.id && s.id) router.push(`/admin/services/${s.id}/`);
        else router.refresh();
      }}
      className="space-y-5"
    >
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Card title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service name *" hint="Full name, used in headings and the enquiry form.">
            <input name="name" required defaultValue={initial.name} className={inputCls} />
          </Field>
          <Field label="Short label *" hint="Used in menus, cards and the footer.">
            <input name="label" required defaultValue={initial.label} className={inputCls} />
          </Field>
          <Field label="URL slug" hint="Page address: /services/your-slug. Leave blank to generate from the label.">
            <input name="slug" defaultValue={initial.slug} className={inputCls} pattern="[a-z0-9\-]*" />
          </Field>
          <Field label="Icon">
            <select name="icon" defaultValue={initial.icon} className={inputCls}>
              {ICON_NAMES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label="Heading — first words" hint='e.g. "HVAC services"'>
            <input name="headingLead" defaultValue={initial.headingLead} className={inputCls} />
          </Field>
          <Field label="Heading — highlighted words" hint='e.g. "in Dubai"'>
            <input name="headingAccent" defaultValue={initial.headingAccent} className={inputCls} />
          </Field>
          <Field label="Short description *" className="sm:col-span-2">
            <textarea name="shortDescription" required rows={2} defaultValue={initial.shortDescription} className={inputCls} />
          </Field>
          <Field label="Full description" className="sm:col-span-2">
            <textarea name="fullDescription" rows={4} defaultValue={initial.fullDescription} className={inputCls} />
          </Field>
          <Field label="Display order" hint="Lower numbers appear first.">
            <input name="order" type="number" min="0" defaultValue={initial.order} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-navy">
            <input type="checkbox" name="published" defaultChecked={initial.published} /> Published on the website
          </label>
        </div>
      </Card>

      <Card title="Images">
        <div className="space-y-5">
          <MediaField name="coverId" label="Main image" value={initial.cover} hint="Shown at the top of the service page and on cards." />
          <MediaGalleryField name="gallery" label="Gallery" values={initial.gallery} />
        </div>
      </Card>

      <Card title="Features">
        <StringListField name="features" label="Key features" values={initial.features} placeholder="e.g. Preventive maintenance" addLabel="Add feature" />
      </Card>

      <Card title="Page content">
        <div className="space-y-6">
          <StringListField name="intro" label="Overview paragraphs" values={initial.intro} multiline addLabel="Add paragraph" />
          <ObjectListField
            name="scope"
            label="What the service covers"
            values={initial.scope}
            fields={[
              { key: "title", label: "Title" },
              { key: "text", label: "Description", type: "textarea" },
            ]}
            addLabel="Add scope item"
          />
          <Field label="“When you need it” heading">
            <input name="whenTitle" defaultValue={initial.whenTitle} className={inputCls} />
          </Field>
          <StringListField name="whenItems" label="“When you need it” points" values={initial.whenItems} addLabel="Add point" />
          <ObjectListField
            name="approach"
            label="How we work (steps)"
            values={initial.approach}
            fields={[
              { key: "title", label: "Step" },
              { key: "text", label: "Description", type: "textarea" },
            ]}
            addLabel="Add step"
          />
          <ObjectListField
            name="faqs"
            label="Frequently asked questions"
            values={initial.faqs}
            fields={[
              { key: "q", label: "Question" },
              { key: "a", label: "Answer", type: "textarea" },
            ]}
            addLabel="Add question"
            hint="Questions also feed Google's FAQ rich results."
          />
        </div>
      </Card>

      <Card title="Related services & WhatsApp">
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-navy/65">Related services (internal links)</span>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {others.map((o) => (
                <label key={o.slug} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="related"
                    value={o.slug}
                    checked={related.includes(o.slug)}
                    onChange={(e) => setRelated((c) => (e.target.checked ? [...c, o.slug] : c.filter((x) => x !== o.slug)))}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <Field label="Pre-filled WhatsApp message">
            <input name="whatsappMessage" defaultValue={initial.whatsappMessage} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="SEO">
        <div className="space-y-4">
          <Field label={`Page title (${seoTitle.length}/60)`} hint="Appears in Google results and the browser tab.">
            <input name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label={`Meta description (${seoDesc.length}/160)`}>
            <textarea name="seoDescription" rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className={inputCls} />
          </Field>
          <div className="rounded-lg border border-line bg-mist/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/45">Google preview</p>
            <p className="mt-1 truncate text-lg text-blue-700">{seoTitle || initial.label}</p>
            <p className="truncate text-xs text-emerald-800">triobuiltgulf.ae › services › {initial.slug || "…"}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-navy/70">{seoDesc || initial.shortDescription}</p>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-xl border border-line bg-white/95 p-2 shadow-lg backdrop-blur">
          <SubmitButton variant="teal">{initial.id ? "Save service" : "Create service"}</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
