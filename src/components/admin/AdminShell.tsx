"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Bell,
  Briefcase,
  Building2,
  FileSignature,
  FileText,
  FolderOpen,
  Globe,
  HardHat,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Search,
  Search as SearchIcon,
  Settings,
  Users,
  Wrench,
  X,
  Activity,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Inbox,
  FileSignature,
  HardHat,
  Wrench,
  Building2,
  Briefcase,
  MessageSquareQuote,
  ImageIcon,
  FolderOpen,
  Globe,
  SearchIcon,
  Users,
  Settings,
  Activity,
  FileText,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export default function AdminShell({
  nav,
  user,
  unread,
  roleLabel,
  children,
}: {
  nav: NavItem[];
  user: { name: string; email: string };
  unread: number;
  roleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href.replace(/\/$/, ""));

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Link href="/admin/" onClick={() => setOpen(false)} aria-label="Dashboard">
          <Image src="/images/logo-full-light.c79eecc0.png" alt="Trio Built Gulf" width={700} height={502} className="h-auto w-28" priority />
        </Link>
        <p className="mt-3 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Admin &amp; CRM</p>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {nav.map((item) => {
          const Icon = ICONS[item.icon] ?? FileText;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active ? <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-[3px] rounded bg-gold" /> : null}
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-gold" : "text-white/50 group-hover:text-teal-300"}`} strokeWidth={1.7} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-white/10 p-4">
        <a href="/" target="_blank" rel="noopener noreferrer" className="block text-xs text-white/50 hover:text-teal-300">
          View public website ↗
        </a>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 bg-navy-950 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85vw] bg-navy-950">
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded p-2 text-white/70 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 text-navy hover:bg-mist lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <form action="/admin/search/" method="get" role="search" className="relative max-w-md flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
            <input
              name="q"
              type="search"
              placeholder="Search leads, quotations, projects…"
              aria-label="Global search"
              className="w-full rounded-lg border border-line bg-mist/60 py-2 pl-9 pr-3 text-sm placeholder:text-navy/40 focus:border-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/25"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/admin/notifications/" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative rounded-lg p-2 text-navy hover:bg-mist">
              <Bell className="h-5 w-5" strokeWidth={1.7} />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>

            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-mist">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-white">
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-navy">{user.name}</span>
                  <span className="block text-[11px] text-navy/55">{roleLabel}</span>
                </span>
              </summary>
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-xl">
                <p className="truncate px-3 py-2 text-xs text-navy/55">{user.email}</p>
                <Link href="/admin/account/" className="block rounded-lg px-3 py-2 text-sm text-navy hover:bg-mist">
                  Account &amp; password
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>

        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
