/**
 * Cuts the front face out of each scanned business card.
 *
 *   node scripts/crop-business-cards.mjs
 *
 * The supplied scans stack both faces on one sheet: the contact side on top,
 * the "Our Core Services" side beneath it. The site lists those services in
 * full already, so only the contact face is published.
 *
 * Sources live in `assets/business-cards/` — outside `public/`, so the full
 * sheets are never served. The crops are written into `public/images/`.
 *
 * The two faces are separated by a band of white paper. Rather than hardcode
 * pixel rows, this finds that band, keeps everything above it, and trims the
 * surrounding white so the card sits flush to its own edges.
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";

const SOURCE = "assets/business-cards";
const DEST = "public/images";

/** Fraction of near-white pixels above which a row counts as bare paper. */
const PAPER_THRESHOLD = 0.98;
/** A gap this many rows tall is the seam between the two faces. */
const MIN_BAND = 4;

/** Row indices of every horizontal band of bare paper. */
async function paperBands(file) {
  const { data, info } = await sharp(file)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bands = [];
  let start = null;

  for (let y = 0; y <= info.height; y++) {
    let light = 0;

    if (y < info.height) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * info.channels;
        if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) light++;
      }
    }

    const isPaper = y < info.height && light / info.width > PAPER_THRESHOLD;
    if (isPaper && start === null) start = y;
    if (!isPaper && start !== null) {
      if (y - start >= MIN_BAND) bands.push([start, y - 1]);
      start = null;
    }
  }

  return { bands, height: info.height, width: info.width };
}

await mkdir(DEST, { recursive: true });

const files = (await readdir(SOURCE)).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (files.length === 0) throw new Error(`no scans found in ${SOURCE}`);

for (const file of files) {
  const source = join(SOURCE, file);
  const { bands, width } = await paperBands(source);

  // The first band is the top margin; the second is the seam between faces.
  const seam = bands.find(([top]) => top > 0);
  if (!seam) throw new Error(`no seam between faces in ${file}`);

  const out = join(DEST, basename(file).replace(/\.[^.]+$/, "") + ".jpg");

  // Two passes: sharp rejects `trim` in the same pipeline as an `extract`,
  // since trim performs an extract of its own.
  const face = await sharp(source)
    .extract({ left: 0, top: 0, width, height: seam[0] })
    .toBuffer();

  const info = await sharp(face)
    .trim({ threshold: 15 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);

  console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}kB`);
}
