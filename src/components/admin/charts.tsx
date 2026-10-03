/**
 * Small dependency-free SVG charts for the dashboard (server-rendered).
 * Colours follow the brand: navy bars, teal/gold accents.
 */

export type Datum = { label: string; value: number };

const NAVY = "#0a2e50";
const TEAL = "#348171";
const GOLD = "#e0b04a";
const PALETTE = [NAVY, TEAL, GOLD, "#4cae9a", "#6b7785", "#c2933a", "#102a4b", "#8bb8ae"];

/** Vertical bars with value labels — used for "enquiries by month". */
export function BarChart({ data, height = 220 }: { data: Datum[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 640;
  const padL = 28;
  const padB = 28;
  const innerH = height - padB - 14;
  const bw = (W - padL) / data.length;
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Bar chart" className="h-auto w-full">
      {ticks.map((t) => {
        const y = 14 + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={padL} x2={W} y1={y} y2={y} stroke="#dfe5e9" strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7785">
              {t}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = padL + i * bw + bw * 0.18;
        const y = 14 + innerH - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw * 0.64} height={Math.max(h, d.value ? 2 : 0)} rx="3" fill={i === data.length - 1 ? TEAL : NAVY} />
            {d.value > 0 ? (
              <text x={x + bw * 0.32} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={NAVY}>
                {d.value}
              </text>
            ) : null}
            <text x={x + bw * 0.32} y={height - 10} textAnchor="middle" fontSize="9.5" fill="#6b7785">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Horizontal bars — used for "by service" / "by project type". */
export function HBarChart({ data, empty = "No data yet" }: { data: Datum[]; empty?: string }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <p className="py-8 text-center text-sm text-navy/45">{empty}</p>;
  }
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium text-navy">{d.label}</span>
            <span className="font-bold tabular-nums text-navy">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full" style={{ width: `${Math.max(4, (d.value / max) * 100)}%`, background: PALETTE[i % PALETTE.length] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Donut chart with legend. */
export function Donut({ data, empty = "No data yet" }: { data: Datum[]; empty?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total === 0) return <p className="py-8 text-center text-sm text-navy/45">{empty}</p>;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" role="img" aria-label="Donut chart" className="h-36 w-36 shrink-0 -rotate-90">
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = (
            <circle
              key={d.label}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="22"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="truncate text-navy">{d.label}</span>
            </span>
            <span className="font-bold tabular-nums text-navy">
              {d.value} <span className="font-normal text-navy/45">({Math.round((d.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Pipeline funnel: one tapering bar per stage with conversion from the first stage. */
export function Funnel({ stages }: { stages: { label: string; value: number; tone: string }[] }) {
  const first = Math.max(1, stages[0]?.value ?? 1);
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <ul className="space-y-2.5">
      {stages.map((s) => (
        <li key={s.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs font-medium text-navy">{s.label}</span>
          <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-mist">
            <div className="flex h-full items-center rounded-md px-2 text-xs font-bold text-white" style={{ width: `${Math.max(8, (s.value / max) * 100)}%`, background: s.tone }}>
              {s.value}
            </div>
          </div>
          <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-navy/50">{Math.round((s.value / first) * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}

export const CHART_TONES = { NAVY, TEAL, GOLD };
