/**
 * Static asset paths.
 *
 * GitHub Pages serves a project site from `/<repo>`, so the build sets
 * NEXT_PUBLIC_BASE_PATH to that prefix (see `next.config.ts`). Next.js applies
 * it to routes and to its own bundles automatically, but NOT to files served
 * straight out of `public/` — those need the prefix added by hand.
 *
 * The variable is inlined at build time, so this works in server and client
 * components alike.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a `public/` path with the base path. Leaves absolute URLs alone. */
export function asset(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${basePath}${path}`;
}
