import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const jobs = [
  { key: "logo", file: "public/images/logo-full.c79eecc0.png", w: 420, png: true },
  { key: "logoLight", file: "public/images/logo-full-light.c79eecc0.png", w: 420, png: true },
  { key: "hero", file: "public/images/hero-dubai.jpg", w: 1100, q: 68 },
  { key: "about", file: "public/images/about-towers.jpg", w: 760, q: 66 },
  { key: "mep", file: "public/images/feat-mep.jpg", w: 560, q: 64 },
  { key: "interior", file: "public/images/feat-interior.jpg", w: 560, q: 64 },
  { key: "maintenance", file: "public/images/feat-maintenance.jpg", w: 560, q: 64 },
  { key: "cta", file: "public/images/cta-architecture.jpg", w: 900, q: 64 },
  { key: "cardLR", file: "public/images/card-lakshmikandh-ramadas.jpg", w: 560, q: 76 },
  { key: "cardDM", file: "public/images/card-dilipkumar-muthaiah.jpg", w: 560, q: 76 },
];

const out = {};
let total = 0;

for (const { key, file, w, q, png } of jobs) {
  const pipeline = sharp(file).resize({ width: w, withoutEnlargement: true });
  const buf = png
    ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
    : await pipeline.jpeg({ quality: q, mozjpeg: true }).toBuffer();

  const mime = png ? "image/png" : "image/jpeg";
  out[key] = `data:${mime};base64,${buf.toString("base64")}`;
  total += out[key].length;
  console.log(`${key.padEnd(12)} ${(buf.length / 1024).toFixed(0)}kB`);
}

await writeFile(
  process.argv[2],
  JSON.stringify(out),
);
console.log(`\ntotal base64 ${(total / 1024 / 1024).toFixed(2)} MB`);
