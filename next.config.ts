import type { NextConfig } from "next";

/**
 * The site now runs as a Next.js server (it was a static export) so the admin
 * panel, the enquiry API and database-backed content can work.
 *
 * Static hosts have no image optimiser, and we serve source files as-is, so a
 * custom loader keeps image URLs unchanged. NEXT_PUBLIC_BASE_PATH is empty on
 * our own domain.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  basePath,
  // `contact/` rather than `contact`, so existing indexed URLs stay valid.
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  // Native / large server-only packages are loaded at runtime, not bundled.
  serverExternalPackages: ["sharp", "pdfkit", "@prisma/client", "pg"],
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
