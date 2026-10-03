import Link from "next/link";
import { MediaGrid, MediaUploader, type MediaItem } from "@/components/admin/MediaLibrary";
import { button, EmptyState, inputCls, PageHeading, Pagination } from "@/components/admin/ui";
import { MEDIA_CATEGORIES, mediaUrl } from "@/lib/media";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { storage } from "@/server/storage";

const PER = 24;

export default async function MediaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requirePage("media:view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const canManage = can(user, "media:manage");

  const where = {
    ...(sp.q ? { OR: [{ fileName: { contains: sp.q, mode: "insensitive" as const } }, { originalName: { contains: sp.q, mode: "insensitive" as const } }, { alt: { contains: sp.q, mode: "insensitive" as const } }] } : {}),
    ...(sp.category && MEDIA_CATEGORIES.some(([v]) => v === sp.category) ? { category: sp.category as never } : {}),
    ...(sp.type === "images" ? { mimeType: { startsWith: "image/" } } : sp.type === "documents" ? { NOT: { mimeType: { startsWith: "image/" } } } : {}),
    ...(sp.visibility === "private" ? { isPublic: false } : sp.visibility === "public" ? { isPublic: true } : {}),
  };

  const [total, rows, projects, services] = await Promise.all([
    db.media.count({ where }),
    db.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER }),
    db.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.service.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const privateLinks: Record<string, string> = {};
  await Promise.all(
    rows
      .filter((m) => !m.isPublic)
      .map(async (m) => {
        privateLinks[m.id] = await storage().signedUrl(m.storageKey, { expiresIn: 600, fileName: m.originalName });
      }),
  );

  const items: MediaItem[] = rows.map((m) => ({
    id: m.id,
    fileName: m.fileName,
    originalName: m.originalName,
    mimeType: m.mimeType,
    size: m.size,
    width: m.width,
    height: m.height,
    category: m.category,
    alt: m.alt,
    isPublic: m.isPublic,
    url: m.isPublic ? mediaUrl(m.storageKey) : "",
    createdAt: m.createdAt.toISOString(),
  }));

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const k of ["q", "category", "type", "visibility"] as const) if (sp[k]) q.set(k, sp[k] as string);
    if (p > 1) q.set("page", String(p));
    return `/admin/media/${q.toString() ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHeading title="Media library" subtitle={`${total} file${total === 1 ? "" : "s"} — stored in object storage, not in the database.`} />

      {canManage ? (
        <div className="mb-5">
          <MediaUploader />
        </div>
      ) : null}

      <form className="mb-5 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search files…" aria-label="Search files" className={`${inputCls} lg:col-span-2`} />
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className={inputCls}>
          <option value="">All categories</option>
          {MEDIA_CATEGORIES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={sp.type ?? ""} aria-label="Type" className={inputCls}>
          <option value="">Images &amp; documents</option>
          <option value="images">Images only</option>
          <option value="documents">Documents only</option>
        </select>
        <div className="flex gap-2">
          <select name="visibility" defaultValue={sp.visibility ?? ""} aria-label="Visibility" className={inputCls}>
            <option value="">Any visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button className={button("primary")}>Go</button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No files yet"
          text="Upload project photos, brochures and certificates above."
          action={
            sp.q || sp.category || sp.type || sp.visibility ? (
              <Link href="/admin/media/" className={button("secondary")}>
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <MediaGrid items={items} canManage={canManage} projects={projects} services={services} privateLinks={privateLinks} />
          <Pagination page={page} pages={Math.max(1, Math.ceil(total / PER))} hrefFor={href} />
        </>
      )}
    </>
  );
}
