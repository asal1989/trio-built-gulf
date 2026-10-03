import type { Metadata } from "next";

/** Everything under /admin is private: never indexed, never cached. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-mist text-navy">{children}</div>;
}
