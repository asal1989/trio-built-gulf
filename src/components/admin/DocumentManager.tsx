"use client";

import { deleteDocument, saveDocument } from "@/app/admin/(panel)/documents/actions";
import { ActionForm, ConfirmForm, Field, Modal, SubmitButton, useToast } from "./forms";
import { Badge, button, DataTable, inputCls, td, th } from "./ui";

export const DOC_TYPES: [string, string][] = [
  ["COMPANY_PROFILE", "Company Profile"],
  ["CAPABILITY_STATEMENT", "Capability Statement"],
  ["BROCHURE", "Brochure"],
  ["CERTIFICATE", "Certificate"],
  ["TRADE_LICENCE", "Trade Licence"],
  ["OTHER", "Other"],
];

export type DocRow = {
  id: string;
  type: string;
  title: string;
  description: string;
  isPublic: boolean;
  order: number;
  fileName: string | null;
  size: number | null;
  updatedAt: string;
  downloadUrl: string | null; // admin download (signed for private)
};

function DocumentForm({ row, close }: { row?: DocRow; close: () => void }) {
  return (
    <ActionForm action={saveDocument} onSuccess={close} encType="multipart/form-data" className="space-y-3">
      {row ? <input type="hidden" name="id" value={row.id} /> : null}
      <Field label="Title *">
        <input name="title" required defaultValue={row?.title} className={inputCls} placeholder="Trio Built Gulf — Company Profile 2026" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select name="type" defaultValue={row?.type ?? "OTHER"} className={inputCls}>
            {DOC_TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order">
          <input name="order" type="number" min="0" defaultValue={row?.order ?? 100} className={inputCls} />
        </Field>
      </div>
      <Field label="Description">
        <input name="description" defaultValue={row?.description} className={inputCls} />
      </Field>
      <Field label={row ? "Replace file (optional)" : "File *"} hint="PDF, Word, Excel or image. Up to 20 MB.">
        <input name="file" type="file" required={!row} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`} />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked={row?.isPublic ?? false} className="mt-1" />
        <span>
          <strong>Public</strong> — visitors can download it from the website.
          <span className="block text-xs text-navy/55">Leave unticked for private documents (certificates, licences). Private files are only reachable from this admin through expiring links.</span>
        </span>
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={close} className={button("secondary", true)}>
          Cancel
        </button>
        <SubmitButton variant="teal" small pendingText="Uploading…">
          {row ? "Save" : "Upload"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function NewDocumentButton() {
  return (
    <Modal trigger="+ Upload document" triggerClassName={button("teal")} title="Upload a document" wide>
      {(close) => <DocumentForm close={close} />}
    </Modal>
  );
}

function CopyLink({ path }: { path: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={button("secondary", true)}
      onClick={async () => {
        await navigator.clipboard.writeText(new URL(path, window.location.origin).href).catch(() => {});
        toast("success", "Public link copied.");
      }}
    >
      Copy link
    </button>
  );
}

const size = (n: number | null) => (n === null ? "" : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function DocumentTable({ rows }: { rows: DocRow[] }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <th className={th}>Document</th>
          <th className={th}>Type</th>
          <th className={th}>Visibility</th>
          <th className={th}>File</th>
          <th className={th} />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-mist/50">
            <td className={td}>
              <span className="font-semibold">{r.title}</span>
              {r.description ? <div className="text-xs text-navy/55">{r.description}</div> : null}
            </td>
            <td className={td}>{DOC_TYPES.find(([v]) => v === r.type)?.[1] ?? r.type}</td>
            <td className={td}>
              <Badge tone={r.isPublic ? "green" : "orange"}>{r.isPublic ? "Public" : "Private"}</Badge>
            </td>
            <td className={`${td} text-xs text-navy/60`}>
              {r.fileName ?? "—"} {r.size ? `· ${size(r.size)}` : ""}
            </td>
            <td className={`${td} text-right`}>
              <span className="inline-flex flex-wrap justify-end gap-1.5">
                {r.downloadUrl ? (
                  <a href={r.downloadUrl} className={button("secondary", true)}>
                    Download
                  </a>
                ) : null}
                {r.isPublic ? <CopyLink path={`/documents/${r.id}/`} /> : null}
                <Modal trigger="Edit / replace" title={`Edit ${r.title}`} wide>
                  {(close) => <DocumentForm row={r} close={close} />}
                </Modal>
                <ConfirmForm action={deleteDocument} hidden={{ id: r.id }} title="Delete this document?" message="The file is permanently removed." confirmLabel="Delete">
                  Delete
                </ConfirmForm>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
