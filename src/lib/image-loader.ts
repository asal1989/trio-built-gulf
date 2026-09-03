"use client";

import { asset } from "./asset";

/**
 * Image loader for the static export.
 *
 * There is no optimisation server behind a static host, so the source file is
 * served as-is — the loader exists only to add the base path, which the
 * built-in `unoptimized` handling does not do.
 */
export default function staticImageLoader({ src }: { src: string }): string {
  return asset(src);
}
