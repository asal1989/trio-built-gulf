"use client";

import { deleteTestimonial, saveTestimonial } from "@/app/admin/(panel)/testimonials/actions";
import { ActionForm, ConfirmForm, Field, Modal, SubmitButton } from "./forms";
import { MediaField, type PickedMedia } from "./MediaPicker";
import { Badge, button, inputCls } from "./ui";

export type TestimonialRow = {
  id: string;
  name: string;
  company: string;
  position: string;
  quote: string;
  photo: PickedMedia | null;
  order: number;
  published: boolean;
};

function TestimonialForm({ row, close }: { row?: TestimonialRow; close: () => void }) {
  return (
    <ActionForm action={saveTestimonial} onSuccess={close} className="space-y-3">
      {row ? <input type="hidden" name="id" value={row.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Customer name *">
          <input name="name" required defaultValue={row?.name} className={inputCls} />
        </Field>
        <Field label="Company">
          <input name="company" defaultValue={row?.company} className={inputCls} />
        </Field>
        <Field label="Position" className="sm:col-span-2">
          <input name="position" defaultValue={row?.position} className={inputCls} />
        </Field>
      </div>
      <Field label="Testimonial *" hint="Only publish genuine, approved testimonials.">
        <textarea name="quote" required rows={5} defaultValue={row?.quote} className={inputCls} />
      </Field>
      <MediaField name="photoId" label="Photo or logo" value={row?.photo} />
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={row?.published ?? false} /> Published
        </label>
        <Field label="Order">
          <input name="order" type="number" min="0" defaultValue={row?.order ?? 100} className={`${inputCls} !w-24`} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={close} className={button("secondary", true)}>
          Cancel
        </button>
        <SubmitButton variant="teal" small>
          Save
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function NewTestimonialButton() {
  return (
    <Modal trigger="+ New testimonial" triggerClassName={button("teal")} title="New testimonial" wide>
      {(close) => <TestimonialForm close={close} />}
    </Modal>
  );
}

export default function TestimonialList({ rows }: { rows: TestimonialRow[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(4,18,31,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy font-display text-sm font-bold text-white">
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo.url} alt="" className="h-full w-full object-cover" />
              ) : (
                r.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-navy">{r.name}</p>
              <p className="text-xs text-navy/55">{[r.position, r.company].filter(Boolean).join(", ")}</p>
            </div>
            <Badge tone={r.published ? "green" : "neutral"}>{r.published ? "Published" : "Draft"}</Badge>
          </div>
          <p className="mt-3 line-clamp-4 flex-1 text-sm italic text-navy/75">&ldquo;{r.quote}&rdquo;</p>
          <div className="mt-4 flex gap-2">
            <Modal trigger="Edit" title="Edit testimonial" wide>
              {(close) => <TestimonialForm row={r} close={close} />}
            </Modal>
            <ConfirmForm action={deleteTestimonial} hidden={{ id: r.id }} title="Delete this testimonial?" message="It will be removed from the website." confirmLabel="Delete">
              Delete
            </ConfirmForm>
          </div>
        </li>
      ))}
    </ul>
  );
}
