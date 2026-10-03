import SiteChrome from "@/components/SiteChrome";

// Content is read from the database (cached by tag), so these pages render on demand.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
