"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/enquiry-options";
import { moveLead } from "@/app/admin/(panel)/leads/actions";
import { useToast } from "./forms";
import { leadCode, STATUS_TONE, waDigits } from "./lead-ui";

export type BoardLead = {
  id: string;
  number: number;
  name: string;
  company: string | null;
  serviceLabel: string | null;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  followUpAt: string | null;
  createdAt: string;
  assignedTo: string | null;
  status: keyof typeof LEAD_STATUS_LABELS;
};

const COLUMN_TOP: Record<string, string> = {
  blue: "border-t-blue-500",
  purple: "border-t-violet-500",
  orange: "border-t-orange-500",
  gold: "border-t-gold",
  teal: "border-t-teal",
  green: "border-t-emerald-500",
  red: "border-t-red-500",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Dubai" });

/**
 * Drag-and-drop pipeline. Cards also have a status <select>, so the board is
 * fully usable from the keyboard and on touch screens.
 */
export default function LeadsBoard({
  leads,
  totals,
  canEdit,
}: {
  leads: BoardLead[];
  totals: Record<string, number>;
  canEdit: boolean;
}) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useOptimistic(leads, (cur, move: { id: string; status: BoardLead["status"] }) =>
    cur.map((l) => (l.id === move.id ? { ...l, status: move.status } : l)),
  );

  const move = (id: string, status: BoardLead["status"]) => {
    const lead = optimistic.find((l) => l.id === id);
    if (!lead || lead.status === status || !canEdit) return;
    startTransition(async () => {
      setOptimistic({ id, status });
      const res = await moveLead(id, status);
      if (res.error) toast("error", res.error);
      else toast("success", `${leadCode(lead.number)} → ${LEAD_STATUS_LABELS[status]}`);
    });
  };

  const now = Date.now();

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-3">
        {LEAD_STATUS_ORDER.map((status) => {
          const items = optimistic.filter((l) => l.status === status);
          const tone = STATUS_TONE[status];
          const total = totals[status] ?? items.length;
          return (
            <section
              key={status}
              aria-label={LEAD_STATUS_LABELS[status]}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setOverCol(status);
              }}
              onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) move(dragId, status);
                setDragId(null);
                setOverCol(null);
              }}
              className={`flex w-72 shrink-0 flex-col rounded-xl border border-line border-t-[3px] bg-white/70 ${COLUMN_TOP[tone]} ${
                overCol === status ? "bg-teal/5 ring-2 ring-teal/40" : ""
              }`}
            >
              <header className="flex items-center justify-between px-3 py-2.5">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.1em] text-navy">{LEAD_STATUS_LABELS[status]}</h3>
                <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-bold text-navy/70">{total}</span>
              </header>
              <ul className="flex max-h-[68vh] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {items.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-navy/40">No leads</li>
                ) : null}
                {items.map((l) => {
                  const overdue = l.followUpAt && new Date(l.followUpAt).getTime() < now && status !== "WON" && status !== "LOST";
                  return (
                    <li
                      key={l.id}
                      draggable={canEdit}
                      onDragStart={(e) => {
                        setDragId(l.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={`rounded-lg border border-line bg-white p-3 shadow-sm transition hover:shadow-md ${canEdit ? "cursor-grab active:cursor-grabbing" : ""} ${
                        dragId === l.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/leads/${l.id}/`} className="min-w-0 text-sm font-semibold text-navy hover:text-teal-700">
                          <span className="block truncate">{l.name}</span>
                        </Link>
                        <span className="shrink-0 text-[10px] font-semibold text-navy/45">{leadCode(l.number)}</span>
                      </div>
                      {l.company ? <p className="truncate text-xs text-navy/60">{l.company}</p> : null}
                      {l.serviceLabel ? <p className="mt-1.5 truncate text-xs font-medium text-teal-700">{l.serviceLabel}</p> : null}
                      {l.location ? <p className="truncate text-xs text-navy/50">{l.location}</p> : null}
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-navy/50">
                        <span>{fmt(l.createdAt)}</span>
                        {l.followUpAt ? (
                          <span className={`rounded px-1.5 py-0.5 font-semibold ${overdue ? "bg-red-50 text-red-700" : "bg-gold/15 text-[#8a6410]"}`}>
                            ⏰ {fmt(l.followUpAt)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] text-navy/55">{l.assignedTo ?? "Unassigned"}</span>
                        <span className="flex shrink-0 gap-2 text-[11px] font-semibold">
                          {l.phone ? (
                            <a href={`tel:${l.phone.replace(/[^+\d]/g, "")}`} className="text-teal-700 hover:underline" aria-label={`Call ${l.name}`}>
                              Call
                            </a>
                          ) : null}
                          {waDigits(l.whatsapp ?? l.phone) ? (
                            <a
                              href={`https://wa.me/${waDigits(l.whatsapp ?? l.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline"
                              aria-label={`WhatsApp ${l.name}`}
                            >
                              WA
                            </a>
                          ) : null}
                        </span>
                      </div>
                      {canEdit ? (
                        <select
                          aria-label={`Move ${l.name} to another stage`}
                          value={l.status}
                          onChange={(e) => move(l.id, e.target.value as BoardLead["status"])}
                          className="mt-2 w-full rounded-md border border-line bg-mist/60 px-2 py-1 text-[11px] text-navy"
                        >
                          {LEAD_STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
