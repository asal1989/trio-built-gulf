import DocumentTable, { NewDocumentButton, type DocRow } from "@/components/admin/DocumentManager";
import { Card, EmptyState, PageHeading } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";
import { storage } from "@/server/storage";

export default async function DocumentsPage() {
  await requirePage("document:manage");
  const docs = await db.document.findMany({ orderBy: [{ type: "asc" }, { order: "asc" }, { title: "asc" }], include: { media: true } });

  const rows: DocRow[] = await Promise.all(
    docs.map(async (d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      description: d.description ?? "",
      isPublic: d.isPublic,
      order: d.order,
      fileName: d.media?.originalName ?? null,
      size: d.media?.size ?? null,
      updatedAt: d.updatedAt.toISOString(),
      downloadUrl: d.media
        ? d.isPublic
          ? mediaUrl(d.media.storageKey)
          : await storage().signedUrl(d.media.storageKey, { expiresIn: 600, fileName: d.media.originalName })
        : null,
    })),
  );

  return (
    <>
      <PageHeading title="Documents" subtitle="Company profile, capability statement, brochures, certificates and licences." actions={<NewDocumentButton />} />
      <Card className="mb-5" title="How documents are published">
        <ul className="list-disc space-y-1 pl-5 text-sm text-navy/70">
          <li>
            A <strong>public</strong> Company Profile is offered as a download on the website (<code>/documents/company-profile/</code>); uploading a new file replaces it.
          </li>
          <li>
            <strong>Private</strong> documents such as the trade licence are never shown to visitors and open only from here through links that expire.
          </li>
        </ul>
      </Card>
      {rows.length === 0 ? <EmptyState title="No documents yet" text="Upload your company profile first — it adds a Download button to the website." /> : <DocumentTable rows={rows} />}
    </>
  );
}
