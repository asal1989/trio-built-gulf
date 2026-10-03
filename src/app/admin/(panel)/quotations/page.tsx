import Link from "next/link";
import {
  Badge,
  button,
  Card,
  DataTable,
  EmptyState,
  formatDate,
  formatMoney,
  inputCls,
  PageHeading,
  Pagination,
  td,
  th,
  type Tone,
} from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";

const STATUS_TONE: Record<string, Tone> = { DRAFT: "neutral", SENT: "gold", ACCEPTED: "green", REJECTED: "red", EXPIRED: "orange" };
const STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"] as const;
const PER = 20;
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function QuotationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requirePage("quote:view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  // Quotations past their validity date that are still "sent" become expired.
  await db.quotation.updateMany({ where: { status: "SENT", validUntil: { lt: new Date() } }, data: { status: "EXPIRED" } });

  const where = {
    ...(sp.status && (STATUSES as readonly string[]).includes(sp.status) ? { status: sp.status as (typeof STATUSES)[number] } : {}),
    ...(sp.q
      ? {
          OR: [
            { number: { contains: sp.q, mode: "insensitive" as const } },
            { customerName: { contains: sp.q, mode: "insensitive" as const } },
            { companyName: { contains: sp.q, mode: "insensitive" as const } },
            { projectName: { contains: sp.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows, sums] = await Promise.all([
    db.quotation.count({ where }),
    db.quotation.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER }),
    db.quotation.groupBy({ by: ["status"], _sum: { total: true }, _count: { _all: true } }),
  ]);
  const byStatus = Object.fromEntries(sums.map((s) => [s.status, s]));
  const href = (p: number) => {
    const q = new URLSearchParams();
    if (sp.status) q.set("status", sp.status);
    if (sp.q) q.set("q", sp.q);
    if (p > 1) q.set("page", String(p));
    return `/admin/quotations/${q.toString() ? `?${q}` : ""}`;
  };
  const canManage = can(user, "quote:manage");

  return (
    <>
      <PageHeading
        title="Quotations"
        subtitle={`${total} quotation${total === 1 ? "" : "s"}`}
        actions={
          canManage ? (
            <Link href="/admin/quotations/new/" className={button("teal")}>
              + New quotation
            </Link>
          ) : undefined
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["SENT", "ACCEPTED", "REJECTED", "DRAFT"] as const).map((s) => (
          <Link key={s} href={`/admin/quotations/?status=${s}`} className="rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-navy/55">{label(s)}</p>
            <p className="mt-1 font-display text-xl font-extrabold text-navy">{byStatus[s]?._count._all ?? 0}</p>
            <p className="text-xs text-navy/55">{formatMoney(byStatus[s]?._sum.total ?? 0)}</p>
          </Link>
        ))}
      </div>

      <form className="mb-5 flex flex-wrap gap-2 rounded-xl border border-line bg-white p-3">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search number, customer, project…" aria-label="Search quotations" className={`${inputCls} max-w-sm flex-1`} />
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={`${inputCls} !w-auto`}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <button className={button("primary")}>Filter</button>
        <Link href="/admin/quotations/" className={button("secondary")}>
          Reset
        </Link>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No quotations yet"
          text="Create one from a lead, or start a blank quotation."
          action={
            canManage ? (
              <Link href="/admin/quotations/new/" className={button("teal")}>
                New quotation
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <DataTable>
            <thead>
              <tr>
                <th className={th}>Number</th>
                <th className={th}>Customer</th>
                <th className={th}>Project</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Total</th>
                <th className={th}>Valid until</th>
                <th className={th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className="hover:bg-mist/50">
                  <td className={td}>
                    <Link href={`/admin/quotations/${q.id}/`} className="font-semibold text-teal-700 hover:underline">
                      {q.number}
                    </Link>
                  </td>
                  <td className={td}>
                    <div className="font-medium">{q.customerName}</div>
                    {q.companyName ? <div className="text-xs text-navy/55">{q.companyName}</div> : null}
                  </td>
                  <td className={td}>{q.projectName ?? "—"}</td>
                  <td className={td}>
                    <Badge tone={STATUS_TONE[q.status]}>{label(q.status)}</Badge>
                  </td>
                  <td className={`${td} text-right font-semibold tabular-nums`}>{formatMoney(q.total, q.currency)}</td>
                  <td className={td}>{formatDate(q.validUntil)}</td>
                  <td className={td}>{formatDate(q.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <Pagination page={page} pages={Math.max(1, Math.ceil(total / PER))} hrefFor={href} />
        </>
      )}

      <Card className="mt-6" title="How the quotation workflow works">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-navy/70">
          <li>
            Open a lead and choose <strong>Create quotation</strong>, or start a blank one.
          </li>
          <li>
            Save as a draft, check the PDF, then <strong>Send to customer</strong> — the PDF is emailed and the lead moves to <em>Quotation sent</em>.
          </li>
          <li>
            Mark it <strong>Accepted</strong> and the lead is marked <em>Won</em> with the quotation value.
          </li>
        </ol>
      </Card>
    </>
  );
}
