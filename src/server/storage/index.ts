import "server-only";
import { randomBytes } from "node:crypto";
import { LocalStorage } from "./local";
import { S3Storage } from "./s3";

/**
 * Object storage abstraction.
 *
 *  - Production: an S3-compatible bucket (Railway Bucket, Cloudflare R2, AWS S3…)
 *    configured through S3_* environment variables.
 *  - Local development: files under .data/uploads, so the app runs with no
 *    cloud account. Never used when S3_BUCKET is set.
 *
 * The database stores only metadata and the storage key — never file bytes.
 */
export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ body: Buffer; contentType: string } | null>;
  delete(key: string): Promise<void>;
  /** Time-limited URL for downloading a private file. */
  signedUrl(key: string, opts: { expiresIn: number; fileName?: string }): Promise<string>;
}

let instance: Storage | undefined;

export function storage(): Storage {
  if (!instance) {
    instance = process.env.S3_BUCKET ? new S3Storage() : new LocalStorage();
  }
  return instance;
}

export const usingCloudStorage = () => Boolean(process.env.S3_BUCKET);

/** Collision-proof, URL-safe key: <prefix>/<yyyy>/<mm>/<random>-<slugged-name>. */
export function makeStorageKey(prefix: string, originalName: string): string {
  const now = new Date();
  const ext = (originalName.match(/\.[A-Za-z0-9]{1,8}$/)?.[0] ?? "").toLowerCase();
  const base = originalName
    .replace(/\.[A-Za-z0-9]{1,8}$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${prefix}/${now.getUTCFullYear()}/${mm}/${randomBytes(6).toString("hex")}-${base || "file"}${ext}`;
}
