import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Storage } from "./index";

const ROOT = path.resolve(process.env.LOCAL_UPLOAD_DIR ?? ".data/uploads");

/** Resolve a key to a path, refusing anything that escapes ROOT. */
function resolveKey(key: string): string {
  const full = path.resolve(ROOT, key);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) throw new Error("Invalid storage key");
  return full;
}

const secret = () => process.env.AUTH_SECRET ?? "dev-only-secret-change-me";

export function signLocalUrl(key: string, expiresAt: number, fileName?: string): string {
  const mac = createHmac("sha256", secret()).update(`${key}|${expiresAt}|${fileName ?? ""}`).digest("hex");
  const q = new URLSearchParams({ exp: String(expiresAt), sig: mac });
  if (fileName) q.set("name", fileName);
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}?${q}`;
}

export function verifyLocalSignature(key: string, exp: string, sig: string, fileName?: string): boolean {
  const expiresAt = Number(exp);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(`${key}|${expiresAt}|${fileName ?? ""}`).digest();
  const given = Buffer.from(sig, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export class LocalStorage implements Storage {
  async put(key: string, body: Buffer, contentType: string) {
    const file = resolveKey(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    await fs.writeFile(file + ".type", contentType);
  }

  async get(key: string) {
    try {
      const file = resolveKey(key);
      const [body, type] = await Promise.all([
        fs.readFile(file),
        fs.readFile(file + ".type", "utf8").catch(() => "application/octet-stream"),
      ]);
      return { body, contentType: type };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    const file = resolveKey(key);
    await fs.rm(file, { force: true });
    await fs.rm(file + ".type", { force: true });
  }

  async signedUrl(key: string, opts: { expiresIn: number; fileName?: string }) {
    return signLocalUrl(key, Date.now() + opts.expiresIn * 1000, opts.fileName);
  }
}
