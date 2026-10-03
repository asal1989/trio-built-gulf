import "server-only";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getAllSeo } from "./public";

/**
 * Page metadata with admin overrides applied. `defaults` is what the page would
 * use on its own; anything saved under SEO in the admin wins.
 */
export async function pageMeta(opts: { path: string; title: string; description: string }): Promise<Metadata> {
  const o = (await getAllSeo())[opts.path] ?? {};
  const title = o.title || opts.title;
  const description = o.description || opts.description;
  const base = pageMetadata({ path: opts.path, title, description });

  return {
    ...base,
    alternates: { canonical: o.canonical || opts.path },
    openGraph: {
      ...base.openGraph,
      title: o.ogTitle || title,
      description: o.ogDescription || description,
      ...(o.ogImage ? { images: [{ url: o.ogImage, width: 1200, height: 630, alt: o.ogTitle || title }] } : {}),
    },
    twitter: {
      ...base.twitter,
      title: o.ogTitle || title,
      description: o.ogDescription || description,
      ...(o.ogImage ? { images: [o.ogImage] } : {}),
    },
    ...(o.robots ? { robots: o.robots } : {}),
  };
}
