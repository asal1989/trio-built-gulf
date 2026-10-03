import Link from "next/link";
import { button, EmptyState } from "@/components/admin/ui";

export default function ForbiddenPage() {
  return (
    <EmptyState
      title="You do not have access to this area"
      text="Your role does not include this section. Ask a Super Admin if you need access."
      action={
        <Link href="/admin/" className={button("primary")}>
          Back to dashboard
        </Link>
      }
    />
  );
}
