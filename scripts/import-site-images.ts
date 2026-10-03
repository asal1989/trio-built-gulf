/**
 * Imports the website's existing photographs into the media library (object
 * storage + Media rows) and attaches them as service covers, so the admin
 * panel starts with the same imagery the public site already uses.
 *
 *   npm run db:seed:media
 *
 * Idempotent: images already imported (same original file name) are reused.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";
import { servicePages } from "../src/lib/service-pages";
import { storage, makeStorageKey } from "../src/server/storage";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const IMAGES = path.resolve("public/images");

const CATEGORY: Record<string, "PROJECT" | "SERVICE" | "GENERAL"> = {
  "proj-commercial.jpg": "PROJECT",
  "proj-facilities.jpg": "PROJECT",
  "proj-interior.jpg": "PROJECT",
  "proj-maintenance.jpg": "PROJECT",
  "proj-residential.jpg": "PROJECT",
  "feat-interior.jpg": "SERVICE",
  "feat-maintenance.jpg": "SERVICE",
  "feat-mep.jpg": "SERVICE",
};

async function importOne(file: string) {
  const existing = await db.media.findFirst({ where: { originalName: file } });
  if (existing) return existing;
  const buffer = fs.readFileSync(path.join(IMAGES, file));
  const meta = await sharp(buffer).metadata();
  const key = makeStorageKey("media", file);
  await storage().put(key, buffer, "image/jpeg");
  return db.media.create({
    data: {
      storageKey: key,
      fileName: file,
      originalName: file,
      mimeType: "image/jpeg",
      size: buffer.length,
      width: meta.width,
      height: meta.height,
      category: CATEGORY[file] ?? "GENERAL",
      alt: file.replace(/\.jpg$/, "").replace(/[-_]/g, " "),
      isPublic: true,
    },
  });
}

async function main() {
  const jpgs = fs.readdirSync(IMAGES).filter((f) => f.endsWith(".jpg") && !f.startsWith("card-"));
  const byFile = new Map<string, string>();
  for (const f of jpgs) byFile.set(f, (await importOne(f)).id);
  console.log(`Media library: ${byFile.size} site images ready.`);

  for (const p of servicePages) {
    const file = path.basename(p.image);
    const mediaId = byFile.get(file);
    if (!mediaId) continue;
    await db.service.updateMany({ where: { slug: p.slug, coverId: null }, data: { coverId: mediaId } });
  }
  console.log("Service covers attached.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
