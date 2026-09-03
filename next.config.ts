import type { NextConfig } from "next";

/**
 * The site is fully prerendered and ships as plain files.
 *
 * GitHub Pages serves a project site from `/<repo>`, so the CI build sets
 * NEXT_PUBLIC_BASE_PATH to that prefix. It is empty for `next dev` and for any
 * host that serves the site from its own domain root.
 *
 * Static hosts have no image optimiser, so a custom loader serves the source
 * files as-is. It also adds the base path, which the built-in `unoptimized`
 * handling leaves off.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Emit `contact/index.html` rather than `contact.html` so the paths resolve
  // on every static host, not only the ones that guess the extension.
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
