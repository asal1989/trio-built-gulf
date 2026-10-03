import Link from "next/link";
import { PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";
import NewLeadForm from "./NewLeadForm";

export default async function NewLeadPage() {
  await requirePage("lead:edit");
  const services = await db.service.findMany({ where: { published: true }, select: { label: true }, orderBy: { order: "asc" } });
  return (
    <>
      <Link href="/admin/leads/" className="mb-3 inline-block text-sm text-teal-700 hover:underline">
        ← All leads
      </Link>
      <PageHeading title="New lead" subtitle="Add an enquiry that came in by phone, WhatsApp, email or in person." />
      <NewLeadForm services={services.map((s) => s.label)} />
    </>
  );
}
