/**
 * Regenerates every logo asset on the site from the master artwork.
 *
 *   node scripts/build-logo.mjs
 *
 * MASTER: public/images/trio_built_gulf_logo_high_resolution.png
 *
 * The master is an 8534px square render of the official vector logo, on the
 * brand's light grey ground (#C9C9C1). Its colours are the authoritative ones
 * and are never altered:
 *
 *     navy  #0A2E50  and  #102A4B
 *     teal  #348171
 *
 * This script:
 *   1. lifts the grey ground to transparency, recovering a true alpha value for
 *      every anti-aliased edge pixel so the logo stays clean over any colour;
 *   2. trims to the artwork;
 *   3. cuts the mark out from above the wordmark;
 *   4. writes a second colourway with the navy set to white, for the site's
 *      navy sections — the standard way a print logo goes onto a dark ground.
 *
 * Produces:
 *   logo-full.png        the lockup, transparent    -> light backgrounds
 *   logo-full-light.png  the lockup, inverted       -> navy backgrounds
 *   logo-mark.png        the mark alone, transparent
 *   src/app/icon.png     favicon, inverted mark on navy
 */
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFile, writeFile, readdir, unlink } from "node:fs/promises";

const MASTER = "public/images/trio_built_gulf_logo_high_resolution.png";
const OUT = "public/images/";

const GROUND = [0xc9, 0xc9, 0xc1]; // the master's light grey ground
const NAVY = { r: 4, g: 18, b: 31, alpha: 1 };

/** Working resolution — far above anything the site renders. */
const WORK = 2400;

/**
 * Lift the flat grey ground to transparency.
 *
 * Every pixel is a blend `a * ink + (1 - a) * ground`. Measuring how far the
 * pixel has travelled from the ground toward its nearest ink colour recovers
 * `a`, and dividing that back out recovers the ink's true colour. A plain
 * colour-key would instead leave a grey fringe on every edge.
 */
async function liftGround(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });

  const INKS = [
    [0x0a, 0x2e, 0x50],
    [0x10, 0x2a, 0x4b],
    [0x34, 0x81, 0x71],
  ];

  for (let i = 0; i < data.length; i += 4) {
    const p = [data[i], data[i + 1], data[i + 2]];

    // Nearest ink, and how far the ground sits from it.
    let ink = INKS[0];
    let best = Infinity;
    for (const c of INKS) {
      const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
      if (d < best) { best = d; ink = c; }
    }

    const span =
      (ink[0] - GROUND[0]) ** 2 +
      (ink[1] - GROUND[1]) ** 2 +
      (ink[2] - GROUND[2]) ** 2;

    // Project the pixel onto the ground -> ink axis to get coverage.
    const dot =
      (p[0] - GROUND[0]) * (ink[0] - GROUND[0]) +
      (p[1] - GROUND[1]) * (ink[1] - GROUND[1]) +
      (p[2] - GROUND[2]) * (ink[2] - GROUND[2]);

    let a = Math.max(0, Math.min(1, dot / span));

    // Floor away the faint residue of the ground so trimming finds the real
    // edges of the artwork rather than near-invisible noise.
    if (a < 0.04) a = 0;

    data[i] = ink[0];
    data[i + 1] = ink[1];
    data[i + 2] = ink[2];
    data[i + 3] = Math.round(a * 255);
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

/** Navy -> white, teal untouched. Navy sits near G=42, teal near G=129. */
async function invertNavyToWhite(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (data[i + 1] < 90) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

/**
 * Output filenames carry a short hash of the master artwork.
 *
 * Without it the filenames never change, so browsers and CDNs keep serving a
 * previously cached logo long after the master has been replaced — the file on
 * disk is new but nobody sees it. Hashing the name changes the URL, so a new
 * logo always reaches every visitor immediately.
 */
const HASH = createHash("sha256")
  .update(await readFile(MASTER))
  .digest("hex")
  .slice(0, 8);

const emitted = {};

async function emit(buffer, key, base, width) {
  const name = `${base}.${HASH}.png`;
  const out = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(OUT + name, out);
  const { width: w, height: h } = await sharp(out).metadata();
  emitted[key] = { src: "/images/" + name, width: w, height: h };
  console.log(`${name.padEnd(34)} ${w}x${h}  ${(out.length / 1024).toFixed(1)}KB`);
}

const master = await sharp(MASTER).metadata();
console.log(`master ${master.width}x${master.height}`);

const scaled = await sharp(MASTER).resize({ width: WORK }).png().toBuffer();
const full = await sharp(await liftGround(scaled)).trim({ threshold: 12 }).png().toBuffer();

// Find the transparent band between the mark and the wordmark.
const { data, info } = await sharp(full).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });

const rowHasInk = [];
for (let y = 0; y < info.height; y++) {
  let ink = false;
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 40) { ink = true; break; }
  }
  rowHasInk.push(ink);
}

let markEnd = rowHasInk.indexOf(true);
while (markEnd < rowHasInk.length && rowHasInk[markEnd]) markEnd++;
console.log(`lockup ${info.width}x${info.height} — mark ends at y ${markEnd}`);

const mark = await sharp(
  await sharp(full)
    .extract({ left: 0, top: 0, width: info.width, height: markEnd + 2 })
    .png().toBuffer(),
).trim({ threshold: 12 }).png().toBuffer();

await emit(full, "onLight", "logo-full", 700);
await emit(await invertNavyToWhite(full), "onDark", "logo-full-light", 700);
await emit(mark, "mark", "logo-mark", 400);

// Remove logo builds from previous runs so stale files never ship.
for (const file of await readdir(OUT)) {
  if (/^logo-(full|full-light|mark)./.test(file) && !file.includes(HASH)) {
    await unlink(OUT + file);
    console.log("removed stale " + file);
  }
}

// The component reads these paths, so a rebuild wires the new logo in itself.
await writeFile(
  "src/lib/logo-assets.ts",
  `// GENERATED by scripts/build-logo.mjs — do not edit by hand.
// Filenames are content-hashed so a replaced logo is never served from cache.
export const logoAssets = {
  full: {
    onLight: "${emitted.onLight.src}",
    onDark: "${emitted.onDark.src}",
    width: ${emitted.onLight.width},
    height: ${emitted.onLight.height},
  },
  mark: {
    src: "${emitted.mark.src}",
    width: ${emitted.mark.width},
    height: ${emitted.mark.height},
  },
} as const;
`,
);
console.log("src/lib/logo-assets.ts written");

// Favicon — the inverted mark on brand navy.
const iconMark = await sharp(await invertNavyToWhite(mark))
  .resize({ width: 360, height: 360, fit: "inside" }).toBuffer();

await sharp({ create: { width: 512, height: 512, channels: 4, background: NAVY } })
  .composite([{ input: iconMark, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile("src/app/icon.png");

console.log("src/app/icon.png       512x512");
