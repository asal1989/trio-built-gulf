"use client";

import Link from "next/link";
import { useState } from "react";
import { bulkLeadAction } from "@/app/admin/(panel)/leads/actions";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/enquiry-options";
import { ActionForm, SubmitButton } from "./forms";
import { leadCode, StatusBadge, TYPE_LABEL } from "./lead-ui";
import { Badge, DataTable, inputCls, td, th } from "./ui";

export type TableLead = {
  id: string;
  number: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  serviceLabel: string | null;
  location: string | null;
  status: keyof typeof LEAD_STATUS_LABELS;
  type: keyof typeof TYPE_LABEL;
  assignedTo: string | null;
  followUpAt: string | null;
  createdAt: string;
  attachments: number;
};

const date = (iso: string | null, time = false) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
        timeZone: "Asia/Dubai",
      })
    : "—";

export default function LeadsTable({
  leads,
  staff,
  canEdit,
  canAssign,
  canDelete,
  sortLinks,
  sort,
  dir,
}: {
  leads: TableLead[];
  staff: { id: string; name: string }[];
  canEdit: boolean;
  canAssign: boolean;
  canDelete: boolean;
  sortLinks: Record<string, string>;
  sort: string;
  dir: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState("status");
  const allSelected = leads.length > 0 && selected.size === leads.length;
  const now = Date.now();

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const sortLabel = (field: string, label: string) => (
    <Link href={sortLinks[field] ?? "#"} className="inline-flex items-center gap-1 hover:text-navy">
      {label}
      {sort === field ? <span aria-hidden="true">{dir === "asc" ? "↑" : "↓"}</span> : null}
    </Link>
  );

  return (
    <ActionForm
      action={bulkLeadAction}
      onSuccess={() => setSelected(new Set())}
      className="space-y-3"
    >
      {canEdit && selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 px-4 py-3 text-sm">
          <strong className="text-navy">{selected.size} selected</strong>
          <select name="bulk" value={bulk} onChange={(e) => setBulk(e.target.value)} className={`${inputCls} !w-auto !py-1.5`} aria-label="Bulk action">
            <option value="status">Change status</option>
            {canAssign ? <option value="assign">Assign to…</option> : null}
            {canDelete ? <option value="delete">Delete</option> : null}
          </select>
          {bulk === "status" ? (
            <select name="status" className={`${inputCls} !w-auto !py-1.5`} aria-label="New status" defaultValue="CONTACTED">
              {LEAD_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          ) : null}
          {bulk === "assign" ? (
            <select name="assigneeId" className={`${inputCls} !w-auto !py-1.5`} aria-label="Assign to">
              <option value="">Unassigned</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          ) : null}
          {[...selected].map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <SubmitButton variant={bulk === "delete" ? "danger" : "teal"} small pendingText="Working…">
            Apply
          </SubmitButton>
          <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-navy/60 hover:text-navy">
            Clear
          </button>
        </div>
      ) : null}

      <DataTable>
        <thead>
          <tr>
            {canEdit ? (
              <th className={`${th} w-10`}>
                <input
                  type="checkbox"
                  aria-label="Select all leads on this page"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)))}
                />
              </th>
            ) : null}
            <th className={th}>{sortLabel("number", "Lead")}</th>
            <th className={th}>{sortLabel("name", "Customer")}</th>
            <th className={th}>Service</th>
            <th className={th}>{sortLabel("status", "Status")}</th>
            <th className={th}>Assigned</th>
            <th className={th}>{sortLabel("followUpAt", "Follow-up")}</th>
            <th className={th}>{sortLabel("createdAt", "Received")}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const overdue = l.followUpAt && new Date(l.followUpAt).getTime() < now && l.status !== "WON" && l.status !== "LOST";
            return (
              <tr key={l.id} className="hover:bg-mist/50">
                {canEdit ? (
                  <td className={td}>
                    <input type="checkbox" aria-label={`Select ${l.name}`} checked={selected.has(l.id)} onChange={() => toggle(l.id)} />
                  </td>
                ) : null}
                <td className={td}>
                  <Link href={`/admin/leads/${l.id}/`} className="font-semibold text-teal-700 hover:underline">
                    {leadCode(l.number)}
                  </Link>
                  {l.type !== "QUOTE" ? (
                    <div className="mt-0.5">
                      <Badge tone={l.type === "MAINTENANCE" ? "orange" : "neutral"}>{TYPE_LABEL[l.type]}</Badge>
                    </div>
                  ) : null}
                </td>
                <td className={td}>
                  <Link href={`/admin/leads/${l.id}/`} className="font-semibold text-navy hover:text-teal-700">
                    {l.name}
                  </Link>
                  <div className="text-xs text-navy/55">{[l.company, l.phone ?? l.email].filter(Boolean).join(" · ")}</div>
                </td>
                <td className={td}>
                  <div className="max-w-[16rem] truncate">{l.serviceLabel ?? "—"}</div>
                  {l.location ? <div className="max-w-[16rem] truncate text-xs text-navy/55">{l.location}</div> : null}
                </td>
                <td className={td}>
                  <StatusBadge status={l.status} />
                </td>
                <td className={td}>{l.assignedTo ?? <span className="text-navy/40">Unassigned</span>}</td>
                <td className={td}>
                  {l.followUpAt ? (
                    <span className={overdue ? "font-semibold text-red-600" : ""}>{date(l.followUpAt, true)}</span>
                  ) : (
                    <span className="text-navy/40">—</span>
                  )}
                </td>
                <td className={td}>
                  {date(l.createdAt)}
                  {l.attachments ? <span className="ml-1.5 text-xs text-navy/50">📎{l.attachments}</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTable>
    </ActionForm>
  );
}
