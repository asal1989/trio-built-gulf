/**
 * Post-export fix for Next.js 16 segment prefetch files.
 *
 * `next build` with `output: "export"` writes a nested route's prefetch payload
 * into a DIRECTORY — `contact/__next.contact/__PAGE__.txt` — but the client
 * requests it with the segments joined by a dot:
 * `contact/__next.contact.__PAGE__.txt`. On a plain file host (GitHub Pages)
 * that is a 404, and every client-side navigation falls back to a full reload.
 *
 * This flattens those directories into the dotted filenames the client asks
 * for. It is a no-op once Next emits them that way itself.
 */
import { readdir, rename, rmdir } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";

async function walk(dir) {
  let moved = 0;

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    if (entry.name.startsWith("__next.")) {
      for (const file of await readdir(path)) {
        await rename(join(path, file), join(dir, `${entry.name}.${file}`));
        moved += 1;
      }
      await rmdir(path);
      continue;
    }

    moved += await walk(path);
  }

  return moved;
}

const moved = await walk(OUT);
console.log(`flatten-prefetch: renamed ${moved} prefetch payload file(s)`);
