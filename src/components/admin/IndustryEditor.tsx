"use client";

import { deleteIndustry, saveIndustry } from "@/app/admin/(panel)/industries/actions";
import Icon, { ICON_NAMES } from "@/components/Icon";
import { ActionForm, ConfirmForm, Field, Modal, SubmitButton } from "./forms";
import { Badge, button, DataTable, inputCls, td, th } from "./ui";

export type IndustryRow = { id: string; name: string; description: string; icon: string; order: number; published: boolean };

function IndustryForm({ row, close }: { row?: IndustryRow; close: () => void }) {
  return (
    <ActionForm action={saveIndustry} onSuccess={close} resetOnSuccess={!row} className="space-y-3">
      {row ? <input type="hidden" name="id" value={row.id} /> : null}
      <Field label="Name *">
        <input name="name" required defaultValue={row?.name} className={inputCls} />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={3} defaultValue={row?.description} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Icon">
          <select name="icon" defaultValue={row?.icon ?? "Building2"} className={inputCls}>
            {ICON_NAMES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Order">
          <input name="order" type="number" min="0" defaultValue={row?.order ?? 100} className={inputCls} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={row?.published ?? true} /> Published
      </label>
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

export function NewIndustryButton() {
  return (
    <Modal trigger="+ New industry" triggerClassName={button("teal")} title="New industry">
      {(close) => <IndustryForm close={close} />}
    </Modal>
  );
}

export default function IndustryTable({ rows, canManage }: { rows: IndustryRow[]; canManage: boolean }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <th className={th}>Order</th>
          <th className={th}>Industry</th>
          <th className={th}>Description</th>
          <th className={th}>Status</th>
          <th className={th} />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-mist/50">
            <td className={`${td} w-16 tabular-nums text-navy/60`}>{r.order}</td>
            <td className={td}>
              <span className="flex items-center gap-2.5 font-semibold">
                <Icon name={r.icon} className="h-5 w-5 text-teal" />
                {r.name}
              </span>
            </td>
            <td className={td}>
              <span className="line-clamp-2 max-w-md text-sm text-navy/65">{r.description || "—"}</span>
            </td>
            <td className={td}>
              <Badge tone={r.published ? "green" : "neutral"}>{r.published ? "Published" : "Hidden"}</Badge>
            </td>
            <td className={`${td} text-right`}>
              {canManage ? (
                <span className="inline-flex gap-1.5">
                  <Modal trigger="Edit" title={`Edit ${r.name}`}>{(close) => <IndustryForm row={r} close={close} />}</Modal>
                  <ConfirmForm action={deleteIndustry} hidden={{ id: r.id }} title={`Delete ${r.name}?`} message="This industry will be removed from the website." confirmLabel="Delete">
                    Delete
                  </ConfirmForm>
                </span>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
