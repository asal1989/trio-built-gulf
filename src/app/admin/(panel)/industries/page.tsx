import IndustryTable, { NewIndustryButton } from "@/components/admin/IndustryEditor";
import { EmptyState, PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

export default async function IndustriesPage() {
  await requirePage("industry:manage");
  const rows = await db.industry.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeading title="Industries" subtitle="The sectors listed on the Industries page of the website." actions={<NewIndustryButton />} />
      {rows.length === 0 ? (
        <EmptyState title="No industries yet" />
      ) : (
        <IndustryTable
          canManage
          rows={rows.map((r) => ({ id: r.id, name: r.name, description: r.description ?? "", icon: r.icon, order: r.order, published: r.published }))}
        />
      )}
    </>
  );
}
