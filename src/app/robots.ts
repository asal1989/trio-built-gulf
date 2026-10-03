import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** The admin, APIs and uploaded files are never crawled. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
