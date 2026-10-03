/**
 * Re-mounts on every navigation, so each new page fades and slides in briefly
 * (~250 ms). Deliberately small — a quick transition, not a showpiece. The
 * header, footer and floating button live in the layout and are not affected.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
