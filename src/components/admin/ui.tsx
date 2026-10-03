import Link from "next/link";
import type { ReactNode } from "react";

/* Presentational building blocks for the admin panel (server-safe). */

export const btn = {
  base: "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
  primary: "bg-navy text-white hover:bg-navy-900",
  teal: "bg-teal text-white hover:bg-teal-700",
  gold: "bg-gold text-navy-950 hover:bg-gold-600",
  secondary: "border border-line bg-white text-navy hover:bg-mist",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-navy hover:bg-mist",
  sm: "px-3 py-1.5 text-xs",
};
export const button = (variant: "primary" | "teal" | "gold" | "secondary" | "danger" | "ghost" = "primary", small = false) =>
  `${btn.base} ${btn[variant]} ${small ? btn.sm : ""}`;

export const inputCls =
  "block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/25 disabled:bg-mist";

export function PageHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-[1.7rem]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-navy/60">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(4,18,31,0.04)] ${className}`}>
      {title || actions ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-navy">{title}</h2>
          {actions}
        </header>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const TONES = {
  neutral: "bg-mist text-navy/70 ring-line",
  teal: "bg-teal/10 text-teal-700 ring-teal/25",
  gold: "bg-gold/15 text-[#8a6410] ring-gold/40",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span aria-hidden="true" className="mb-4 block h-1 w-10 rounded bg-gold" />
      <h3 className="font-display text-base font-bold text-navy">{title}</h3>
      {text ? <p className="mt-1.5 max-w-sm text-sm text-navy/60">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "navy",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
  tone?: "navy" | "teal" | "gold" | "red";
}) {
  const bar = { navy: "bg-navy", teal: "bg-teal", gold: "bg-gold", red: "bg-red-500" }[tone];
  const inner = (
    <div className="relative h-full overflow-hidden rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(4,18,31,0.04)] transition-shadow hover:shadow-md">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-navy/55">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-navy">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-navy/50">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );
  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-navy/55">
        Page {page} of {pages}
      </span>
      <ul className="flex items-center gap-1">
        {page > 1 ? (
          <li>
            <Link href={hrefFor(page - 1)} className={button("secondary", true)}>
              Previous
            </Link>
          </li>
        ) : null}
        {nums.map((n, i) => (
          <li key={n} className="flex items-center gap-1">
            {i > 0 && n - nums[i - 1] > 1 ? <span className="px-1 text-navy/40">…</span> : null}
            <Link
              href={hrefFor(n)}
              aria-current={n === page ? "page" : undefined}
              className={`${btn.base} ${btn.sm} ${n === page ? btn.primary : btn.secondary}`}
            >
              {n}
            </Link>
          </li>
        ))}
        {page < pages ? (
          <li>
            <Link href={hrefFor(page + 1)} className={button("secondary", true)}>
              Next
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

/** Table shell: horizontal scroll on small screens. */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(4,18,31,0.04)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}
export const th = "border-b border-line bg-mist/70 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-navy/55";
export const td = "border-b border-line/70 px-4 py-3 align-middle text-navy";

export function formatDate(d: Date | string | null | undefined, withTime = false): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Dubai",
  });
}

export function formatMoney(n: number | string | { toString(): string }, currency = "AED"): string {
  const v = Number(n.toString());
  return `${currency} ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
