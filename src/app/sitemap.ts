import type { MetadataRoute } from "next";

/**
 * Generated at build time into a static `sitemap.xml`, matching the static
 * export the rest of the site uses. URLs are absolute against the production
 * domain (see `SITE_URL` in `layout.tsx`) rather than the GitHub Pages address
 * this currently deploys to — the canonical links and structured data already
 * follow the same convention, so a search engine reading any of them agrees.
 */
const SITE_URL = "https://triobuiltgulf.ae";

const routes = ["", "/about", "/services", "/projects", "/why-us", "/contact"];

// Required for `output: "export"` — without it the build treats this route as
// dynamic and refuses to prerender it into a static file.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/contact" ? 0.9 : 0.8,
  }));
}
