import AdminShell, { type NavItem } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/forms";
import { requirePage } from "@/server/auth/guard";
import { can, ROLE_LABELS, type Permission } from "@/server/auth/permissions";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const NAV: (NavItem & { permission: Permission })[] = [
  { href: "/admin/", label: "Dashboard", icon: "LayoutDashboard", permission: "dashboard:view" },
  { href: "/admin/leads/", label: "Leads", icon: "Inbox", permission: "lead:view" },
  { href: "/admin/quotations/", label: "Quotations", icon: "FileSignature", permission: "quote:view" },
  { href: "/admin/projects/", label: "Projects", icon: "HardHat", permission: "project:view" },
  { href: "/admin/services/", label: "Services", icon: "Wrench", permission: "service:view" },
  { href: "/admin/industries/", label: "Industries", icon: "Building2", permission: "industry:manage" },
  { href: "/admin/maintenance/", label: "Maintenance", icon: "Briefcase", permission: "lead:view" },
  { href: "/admin/testimonials/", label: "Testimonials", icon: "MessageSquareQuote", permission: "testimonial:manage" },
  { href: "/admin/media/", label: "Media", icon: "ImageIcon", permission: "media:view" },
  { href: "/admin/documents/", label: "Documents", icon: "FolderOpen", permission: "document:manage" },
  { href: "/admin/content/", label: "Website Content", icon: "Globe", permission: "content:manage" },
  { href: "/admin/seo/", label: "SEO", icon: "SearchIcon", permission: "seo:manage" },
  { href: "/admin/users/", label: "Users", icon: "Users", permission: "user:view" },
  { href: "/admin/settings/", label: "Settings", icon: "Settings", permission: "settings:manage" },
  { href: "/admin/activity/", label: "Activity Logs", icon: "Activity", permission: "audit:view" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage();
  const nav = NAV.filter((n) => can(user, n.permission)).map(({ href, label, icon }) => ({ href, label, icon }));
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });

  return (
    <ToastProvider>
      <AdminShell nav={nav} user={{ name: user.name, email: user.email }} unread={unread} roleLabel={ROLE_LABELS[user.role]}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
