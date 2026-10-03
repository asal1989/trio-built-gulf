import Link from "next/link";
import ServiceForm from "@/components/admin/ServiceForm";
import { PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

export default async function NewServicePage() {
  await requirePage("service:manage");
  const others = await db.service.findMany({ select: { slug: true, label: true }, orderBy: { order: "asc" } });
  return (
    <>
      <Link href="/admin/services/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All services
      </Link>
      <PageHeading title="New service" />
      <ServiceForm
        others={others}
        initial={{
          name: "", label: "", slug: "", shortDescription: "", fullDescription: "", headingLead: "", headingAccent: "in Dubai", icon: "Wrench",
          cover: null, gallery: [], features: [], intro: [], scope: [], whenTitle: "", whenItems: [], approach: [], faqs: [], related: [],
          whatsappMessage: "", seoTitle: "", seoDescription: "", order: 100, published: false,
        }}
      />
    </>
  );
}
