import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllSeo, getPublishedProjects, getPublishedServices } from "@/server/content/public";

/**
 * Generated from the database at request time, so a service published in the
 * admin appears here immediately. Pages an admin has set to "noindex" are left out.
 */
export const dynamic = "force-dynamic";

const STATIC_ROUTES = ["", "/about", "/services", "/projects", "/industries", "/maintenance", "/why-us", "/careers", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, seo] = await Promise.all([getPublishedServices(), getPublishedProjects(), getAllSeo()]);
  const lastModified = new Date();

  const routes = [
    ...STATIC_ROUTES,
    ...services.map((s) => `/services/${s.slug}`),
    ...(projects ?? []).filter(() => false).map((p) => `/projects/${p.slug}`), // project detail pages are not public yet
  ];

  return routes
    .filter((route) => !/noindex/i.test(seo[`${route}/`.replace(/^\/\/$/, "/")]?.robots ?? ""))
    .map((route) => ({
      url: `${SITE_URL}${route}/`,
      lastModified,
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : route === "/contact" || route.startsWith("/services/") ? 0.9 : 0.8,
    }));
}
