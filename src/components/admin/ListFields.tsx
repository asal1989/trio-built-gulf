"use client";

import { useState } from "react";
import { button, inputCls } from "./ui";

/**
 * Editors for JSON-backed list fields. Each keeps its rows in state and
 * submits ONE hidden input containing JSON, which the server re-validates
 * with zod — the browser is never trusted.
 */

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-navy/65">{children}</span>
);

function RowControls({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1 text-xs">
      <button type="button" disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up" className="rounded px-1.5 py-0.5 hover:bg-mist disabled:opacity-30">
        ↑
      </button>
      <button type="button" disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Move down" className="rounded px-1.5 py-0.5 hover:bg-mist disabled:opacity-30">
        ↓
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove" className="rounded px-1.5 py-0.5 text-red-600 hover:bg-red-50">
        ✕
      </button>
    </div>
  );
}

function reorder<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const n = [...list];
  [n[i], n[j]] = [n[j], n[i]];
  return n;
}

export function StringListField({
  name,
  label,
  values,
  placeholder,
  multiline = false,
  addLabel = "Add item",
  hint,
}: {
  name: string;
  label: string;
  values: string[];
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
  hint?: string;
}) {
  const [rows, setRows] = useState<string[]>(values);
  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={JSON.stringify(rows.map((r) => r.trim()).filter(Boolean))} />
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea rows={3} value={r} placeholder={placeholder} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} aria-label={`${label} ${i + 1}`} />
            ) : (
              <input value={r} placeholder={placeholder} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} aria-label={`${label} ${i + 1}`} />
            )}
            <RowControls i={i} n={rows.length} onMove={(d) => setRows((c) => reorder(c, i, d))} onRemove={() => setRows((c) => c.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRows((c) => [...c, ""])} className={`${button("secondary", true)} mt-2`}>
        + {addLabel}
      </button>
      {hint ? <p className="mt-1 text-xs text-navy/50">{hint}</p> : null}
    </div>
  );
}

export type ObjectField = { key: string; label: string; type?: "text" | "textarea" | "select"; options?: [string, string][]; placeholder?: string };

export function ObjectListField({
  name,
  label,
  fields,
  values,
  addLabel = "Add item",
  hint,
}: {
  name: string;
  label: string;
  fields: ObjectField[];
  values: Record<string, string>[];
  addLabel?: string;
  hint?: string;
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [rows, setRows] = useState<Record<string, string>[]>(values.map((v) => ({ ...blank(), ...v })));
  const set = (i: number, key: string, v: string) => setRows((c) => c.map((r, j) => (j === i ? { ...r, [key]: v } : r)));

  const nonEmpty = rows.filter((r) => Object.values(r).some((v) => v.trim()));
  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={JSON.stringify(nonEmpty)} />
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start gap-2 rounded-lg border border-line bg-mist/40 p-3">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-navy/50">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea rows={3} value={r[f.key]} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className={inputCls} />
                  ) : f.type === "select" ? (
                    <select value={r[f.key]} onChange={(e) => set(i, f.key, e.target.value)} className={inputCls}>
                      {f.options?.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={r[f.key]} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className={inputCls} />
                  )}
                </label>
              ))}
            </div>
            <RowControls i={i} n={rows.length} onMove={(d) => setRows((c) => reorder(c, i, d))} onRemove={() => setRows((c) => c.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRows((c) => [...c, blank()])} className={`${button("secondary", true)} mt-2`}>
        + {addLabel}
      </button>
      {hint ? <p className="mt-1 text-xs text-navy/50">{hint}</p> : null}
    </div>
  );
}
