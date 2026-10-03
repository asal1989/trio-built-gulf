"use client";

import { useEffect, useRef, useState } from "react";
import { button, inputCls } from "./ui";

export type PickedMedia = { id: string; url: string; alt: string; name: string };

type Feed = PickedMedia & { w: number | null; h: number | null };

/** Modal grid of the media library (public images) used by every CMS form. */
function PickerDialog({
  open,
  onClose,
  onPick,
  multiple,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (items: PickedMedia[]) => void;
  multiple: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Feed[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Map<string, Feed>>(new Map());

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelected(new Map());
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/media/?q=${encodeURIComponent(q)}`);
        setItems(res.ok ? ((await res.json()) as Feed[]) : []);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [open, q]);

  const toggle = (m: Feed) => {
    if (!multiple) {
      onPick([m]);
      onClose();
      return;
    }
    setSelected((cur) => {
      const n = new Map(cur);
      if (n.has(m.id)) n.delete(m.id);
      else n.set(m.id, m);
      return n;
    });
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(96vw,56rem)] max-h-[90vh] overflow-hidden rounded-xl border border-line bg-white p-0 text-navy shadow-2xl backdrop:bg-navy-950/50"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h3 className="font-display text-base font-bold">Choose from media library</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-navy/50 hover:bg-mist">
          ✕
        </button>
      </div>
      <div className="border-b border-line px-5 py-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images…" aria-label="Search images" className={inputCls} />
      </div>
      <div className="max-h-[56vh] overflow-y-auto p-5">
        {loading ? <p className="py-10 text-center text-sm text-navy/50">Loading…</p> : null}
        {!loading && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-navy/50">No images found. Upload some in the Media section first.</p>
        ) : null}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((m) => {
            const on = selected.has(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  aria-pressed={on}
                  className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 ${on ? "border-teal ring-2 ring-teal/30" : "border-line hover:border-teal/60"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt || m.name} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-navy-950/70 px-2 py-1 text-left text-[10px] text-white">{m.name}</span>
                  {on ? <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal text-[11px] font-bold text-white">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {multiple ? (
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <span className="text-sm text-navy/60">{selected.size} selected</span>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => {
              onPick([...selected.values()]);
              onClose();
            }}
            className={button("teal")}
          >
            Add selected
          </button>
        </div>
      ) : null}
    </dialog>
  );
}

/** Single-image field: stores the chosen media id in a hidden input. */
export function MediaField({
  name,
  label,
  value,
  hint,
}: {
  name: string;
  label: string;
  value?: PickedMedia | null;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PickedMedia | null>(value ?? null);

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-navy/65">{label}</span>
      <input type="hidden" name={name} value={picked?.id ?? ""} />
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-navy/25 bg-mist">
          {picked ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picked.url} alt={picked.alt || picked.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] text-navy/40">No image</span>
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <button type="button" onClick={() => setOpen(true)} className={button("secondary", true)}>
            {picked ? "Change image" : "Choose image"}
          </button>
          {picked ? (
            <button type="button" onClick={() => setPicked(null)} className="text-xs font-semibold text-red-600 hover:underline">
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="mt-1 text-xs text-navy/50">{hint}</p> : null}
      <PickerDialog open={open} onClose={() => setOpen(false)} onPick={(items) => setPicked(items[0] ?? null)} multiple={false} />
    </div>
  );
}

/** Gallery field: several images, each submitted as a repeated hidden input. */
export function MediaGalleryField({ name, label, values }: { name: string; label: string; values?: PickedMedia[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PickedMedia[]>(values ?? []);

  const move = (i: number, dir: -1 | 1) =>
    setItems((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const n = [...cur];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-navy/65">{label}</span>
      {items.map((m) => (
        <input key={m.id} type="hidden" name={name} value={m.id} />
      ))}
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {items.map((m, i) => (
          <li key={m.id} className="group relative">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt || m.name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move earlier" className="rounded px-1.5 py-0.5 hover:bg-mist">
                  ←
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move later" className="rounded px-1.5 py-0.5 hover:bg-mist">
                  →
                </button>
              </span>
              <button type="button" onClick={() => setItems((c) => c.filter((x) => x.id !== m.id))} className="font-semibold text-red-600 hover:underline">
                Remove
              </button>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setOpen(true)} className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-dashed border-navy/30 text-sm font-semibold text-navy/60 hover:border-teal hover:text-teal-700">
            + Add images
          </button>
        </li>
      </ul>
      <PickerDialog
        open={open}
        onClose={() => setOpen(false)}
        multiple
        onPick={(picked) =>
          setItems((cur) => {
            const have = new Set(cur.map((c) => c.id));
            return [...cur, ...picked.filter((p) => !have.has(p.id))];
          })
        }
      />
    </div>
  );
}
