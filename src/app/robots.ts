import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Generated at build time into a static `robots.txt`, alongside sitemap.ts. */

// Required for `output: "export"` — without it the build treats this route as
// dynamic and refuses to prerender it into a static file.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
