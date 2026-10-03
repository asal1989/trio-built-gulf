import { PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";

export default async function DashboardPage() {
  const user = await requirePage("dashboard:view");
  return <PageHeading title={`Welcome, ${user.name.split(" ")[0]}`} subtitle="Dashboard coming up next." />;
}
