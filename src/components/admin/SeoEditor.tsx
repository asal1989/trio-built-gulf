"use client";

import { useState } from "react";
import { resetSeo, saveSeo } from "@/app/admin/(panel)/seo/actions";
import { ActionForm, ConfirmForm, Field, Modal, SubmitButton } from "./forms";
import { MediaField, type PickedMedia } from "./MediaPicker";
import { Badge, button, DataTable, inputCls, td, th } from "./ui";

export type SeoRow = {
  path: string;
  label: string;
  /** What the page uses when there is no override. */
  defaultTitle: string;
  defaultDescription: string;
  custom: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: PickedMedia | null;
    robots: string;
  } | null;
};

function SeoForm({ row, close }: { row: SeoRow; close: () => void }) {
  const c = row.custom;
  const [title, setTitle] = useState(c?.title ?? "");
  const [desc, setDesc] = useState(c?.description ?? "");
  return (
    <ActionForm action={saveSeo} onSuccess={close} className="space-y-4">
      <input type="hidden" name="path" value={row.path} />
      <p className="text-xs text-navy/55">Leave a field empty to keep the page&rsquo;s standard value.</p>
      <Field label={`Page title (${(title || row.defaultTitle).length}/60)`} hint={`Standard: ${row.defaultTitle}`}>
        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputCls} />
      </Field>
      <Field label={`Meta description (${(desc || row.defaultDescription).length}/160)`} hint={`Standard: ${row.defaultDescription.slice(0, 110)}${row.defaultDescription.length > 110 ? "…" : ""}`}>
        <textarea name="description" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={320} className={inputCls} />
      </Field>
      <div className="rounded-lg border border-line bg-mist/50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/45">Google preview</p>
        <p className="mt-1 truncate text-base text-blue-700">{title || row.defaultTitle}</p>
        <p className="truncate text-xs text-emerald-800">triobuiltgulf.ae{row.path}</p>
        <p className="line-clamp-2 text-xs text-navy/70">{desc || row.defaultDescription}</p>
      </div>
      <Field label="Canonical URL" hint="Only change this if the page duplicates another address.">
        <input name="canonicalUrl" defaultValue={c?.canonicalUrl ?? ""} placeholder={row.path} className={inputCls} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Social share title">
          <input name="ogTitle" defaultValue={c?.ogTitle ?? ""} maxLength={120} className={inputCls} />
        </Field>
        <Field label="Robots">
          <select name="robots" defaultValue={c?.robots ?? ""} className={inputCls}>
            <option value="">Standard (index, follow)</option>
            <option value="index, follow">Index, follow</option>
            <option value="noindex, follow">Hide from Google (noindex)</option>
            <option value="noindex, nofollow">Hide and do not follow links</option>
          </select>
        </Field>
      </div>
      <Field label="Social share description">
        <textarea name="ogDescription" rows={2} defaultValue={c?.ogDescription ?? ""} maxLength={320} className={inputCls} />
      </Field>
      <MediaField name="ogImageId" label="Social share image" value={c?.ogImage} hint="Best at 1200 × 630 px." />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={close} className={button("secondary", true)}>
          Cancel
        </button>
        <SubmitButton variant="teal" small>
          Save SEO
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export default function SeoTable({ rows }: { rows: SeoRow[] }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <th className={th}>Page</th>
          <th className={th}>Title in Google</th>
          <th className={th}>Status</th>
          <th className={th} />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.path} className="hover:bg-mist/50">
            <td className={td}>
              <span className="font-semibold">{r.label}</span>
              <a href={r.path} target="_blank" rel="noopener noreferrer" className="block text-xs text-teal-700 hover:underline">
                {r.path} ↗
              </a>
            </td>
            <td className={`${td} max-w-md`}>
              <span className="line-clamp-2 text-sm">{r.custom?.title || r.defaultTitle}</span>
            </td>
            <td className={td}>
              {r.custom ? (
                <span className="flex flex-wrap gap-1">
                  <Badge tone="teal">Customised</Badge>
                  {r.custom.robots.includes("noindex") ? <Badge tone="red">noindex</Badge> : null}
                </span>
              ) : (
                <Badge>Standard</Badge>
              )}
            </td>
            <td className={`${td} text-right`}>
              <span className="inline-flex gap-1.5">
                <Modal trigger="Edit SEO" title={`SEO — ${r.label}`} wide>
                  {(close) => <SeoForm row={r} close={close} />}
                </Modal>
                {r.custom ? (
                  <ConfirmForm action={resetSeo} hidden={{ path: r.path }} title="Reset SEO?" message="The page returns to its standard title, description and social settings." confirmLabel="Reset">
                    Reset
                  </ConfirmForm>
                ) : null}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
