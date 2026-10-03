import Link from "next/link";
import ContentEditor from "@/components/admin/ContentEditor";
import { ConfirmForm } from "@/components/admin/forms";
import { Badge, PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { CONTENT_DEFS, contentDef, resolveContent } from "@/server/content/defaults";
import { db } from "@/server/db";
import { resetContent } from "./actions";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requirePage("content:manage");
  const { tab } = await searchParams;
  const def = contentDef(tab ?? "") ?? CONTENT_DEFS[0];

  const [pages, blocks] = await Promise.all([db.page.findMany({ select: { slug: true } }), db.contentBlock.findMany({ select: { key: true } })]);
  const customised = new Set([...pages.map((p) => p.slug), ...blocks.map((b) => b.key)]);

  const row = def.group === "page" ? await db.page.findUnique({ where: { slug: def.key } }) : await db.contentBlock.findUnique({ where: { key: def.key } });
  const saved = row ? (def.group === "page" ? (row as { content: unknown }).content : (row as { data: unknown }).data) : null;
  const values = resolveContent(def, saved);

  const groups: [string, typeof CONTENT_DEFS][] = [
    ["Pages", CONTENT_DEFS.filter((d) => d.group === "page")],
    ["Company content", CONTENT_DEFS.filter((d) => d.group === "company")],
  ];

  return (
    <>
      <PageHeading
        title="Website content"
        subtitle="Edit the wording on the website without a developer. Leave a field empty to use the standard text."
        actions={
          def.path ? (
            <a href={def.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist">
              View on website ↗
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Content sections" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {groups.map(([label, defs]) => (
            <div key={label}>
              <h2 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-navy/45">{label}</h2>
              <ul className="space-y-0.5">
                {defs.map((d) => (
                  <li key={d.key}>
                    <Link
                      href={`/admin/content/?tab=${d.key}`}
                      aria-current={d.key === def.key ? "page" : undefined}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${d.key === def.key ? "bg-navy font-semibold text-white" : "text-navy hover:bg-white"}`}
                    >
                      {d.title}
                      {customised.has(d.key) ? <span aria-label="Edited" className={`h-1.5 w-1.5 shrink-0 rounded-full ${d.key === def.key ? "bg-gold" : "bg-teal"}`} /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="min-w-0">
          <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-navy/65">
            {def.description}
            {customised.has(def.key) ? <Badge tone="teal">Customised</Badge> : <Badge>Standard text</Badge>}
          </p>
          <ContentEditor key={def.key} def={def} values={values} />
          {customised.has(def.key) ? (
            <div className="mt-5">
              <ConfirmForm action={resetContent} hidden={{ key: def.key }} title="Reset to standard text?" message="Your edits to this section are removed and the original wording returns." confirmLabel="Reset">
                Reset to standard text
              </ConfirmForm>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
