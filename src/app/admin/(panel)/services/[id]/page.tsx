import Link from "next/link";
import { notFound } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import { ConfirmForm } from "@/components/admin/forms";
import { Badge, PageHeading } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";
import { requirePage } from "@/server/auth/guard";
import { can } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { deleteService } from "../actions";

type Pair = { title: string; text: string };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePage("service:view");
  const { id } = await params;
  const s = await db.service.findUnique({
    where: { id },
    include: { cover: true, features: { orderBy: { order: "asc" } }, gallery: { orderBy: { order: "asc" }, include: { media: true } } },
  });
  if (!s) notFound();
  const others = await db.service.findMany({ where: { NOT: { id } }, select: { slug: true, label: true }, orderBy: { order: "asc" } });
  const picked = (m: { id: string; storageKey: string; alt: string | null; fileName: string }) => ({ id: m.id, url: mediaUrl(m.storageKey), alt: m.alt ?? "", name: m.fileName });
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const canManage = can(user, "service:manage");

  if (!canManage) {
    return <PageHeading title={s.label} subtitle="You have read-only access to services." />;
  }

  return (
    <>
      <Link href="/admin/services/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All services
      </Link>
      <PageHeading
        title={s.label}
        subtitle={
          <span className="flex items-center gap-2">
            <Badge tone={s.published ? "green" : "neutral"}>{s.published ? "Published" : "Draft"}</Badge>
            {s.published ? (
              <a href={`/services/${s.slug}/`} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                View on website ↗
              </a>
            ) : null}
          </span>
        }
        actions={
          <ConfirmForm action={deleteService} hidden={{ id: s.id }} title={`Delete “${s.label}”?`} message="The service page will be removed from the website. Existing enquiries keep the service name." confirmLabel="Delete service">
            Delete
          </ConfirmForm>
        }
      />
      <ServiceForm
        others={others}
        initial={{
          id: s.id,
          name: s.name,
          label: s.label,
          slug: s.slug,
          shortDescription: s.shortDescription,
          fullDescription: s.fullDescription ?? "",
          headingLead: s.headingLead ?? "",
          headingAccent: s.headingAccent ?? "",
          icon: s.icon,
          cover: s.cover ? picked(s.cover) : null,
          gallery: s.gallery.map((g) => picked(g.media)),
          features: s.features.map((f) => f.text),
          intro: arr<string>(s.intro),
          scope: arr<Pair>(s.scope),
          whenTitle: s.whenTitle ?? "",
          whenItems: arr<string>(s.whenItems),
          approach: arr<Pair>(s.approach),
          faqs: arr<{ q: string; a: string }>(s.faqs),
          related: s.related,
          whatsappMessage: s.whatsappMessage ?? "",
          seoTitle: s.seoTitle ?? "",
          seoDescription: s.seoDescription ?? "",
          order: s.order,
          published: s.published,
        }}
      />
    </>
  );
}
