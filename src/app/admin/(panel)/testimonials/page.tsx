import TestimonialList, { NewTestimonialButton } from "@/components/admin/TestimonialEditor";
import { EmptyState, PageHeading } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

export default async function TestimonialsPage() {
  await requirePage("testimonial:manage");
  const rows = await db.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }], include: { photo: true } });
  return (
    <>
      <PageHeading
        title="Testimonials"
        subtitle="Add only genuine, approved customer quotes. The testimonials section appears on the home page once at least one is published."
        actions={<NewTestimonialButton />}
      />
      {rows.length === 0 ? (
        <EmptyState title="No testimonials yet" text="Nothing is invented: the website shows no testimonials until you add real ones." />
      ) : (
        <TestimonialList
          rows={rows.map((r) => ({
            id: r.id,
            name: r.name,
            company: r.company ?? "",
            position: r.position ?? "",
            quote: r.quote,
            photo: r.photo ? { id: r.photo.id, url: mediaUrl(r.photo.storageKey), alt: r.photo.alt ?? "", name: r.photo.fileName } : null,
            order: r.order,
            published: r.published,
          }))}
        />
      )}
    </>
  );
}
