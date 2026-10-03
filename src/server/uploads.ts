import "server-only";

/**
 * Upload validation. Never trusts the browser: the declared MIME type is
 * ignored and the file's real type is determined from its leading bytes, then
 * cross-checked with the extension.
 */

export type DetectedFile = { mime: string; ext: string; kind: "image" | "pdf" | "office" | "drawing" };

const startsWith = (b: Buffer, sig: number[], offset = 0) =>
  sig.every((byte, i) => b[offset + i] === byte);

const extOf = (name: string) => (name.match(/\.([A-Za-z0-9]{1,8})$/)?.[1] ?? "").toLowerCase();

export function detectFile(buffer: Buffer, fileName: string): DetectedFile | null {
  const ext = extOf(fileName);
  if (buffer.length < 8) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff]) && ["jpg", "jpeg"].includes(ext))
    return { mime: "image/jpeg", ext: "jpg", kind: "image" };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) && ext === "png")
    return { mime: "image/png", ext: "png", kind: "image" };
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8) && ext === "webp")
    return { mime: "image/webp", ext: "webp", kind: "image" };
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46]) && ext === "pdf")
    return { mime: "application/pdf", ext: "pdf", kind: "pdf" };

  // Legacy Office (OLE2 compound file): .doc / .xls
  if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    if (ext === "doc") return { mime: "application/msword", ext, kind: "office" };
    if (ext === "xls") return { mime: "application/vnd.ms-excel", ext, kind: "office" };
    return null;
  }

  // OOXML (zip container): .docx / .xlsx — look for the part names near the start.
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04])) {
    const head = buffer.subarray(0, Math.min(buffer.length, 64 * 1024)).toString("latin1");
    if (ext === "docx" && head.includes("word/"))
      return { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext, kind: "office" };
    if (ext === "xlsx" && head.includes("xl/"))
      return { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext, kind: "office" };
    return null;
  }

  // AutoCAD drawing: header "AC10xx"
  if (ext === "dwg" && buffer.subarray(0, 2).toString("latin1") === "AC")
    return { mime: "application/acad", ext, kind: "drawing" };

  return null;
}

export type UploadRules = {
  maxBytes: number;
  allowed: DetectedFile["kind"][];
};

export const PUBLIC_ENQUIRY_RULES: UploadRules = {
  maxBytes: 10 * 1024 * 1024,
  allowed: ["image", "pdf", "office", "drawing"],
};
export const ADMIN_MEDIA_RULES: UploadRules = {
  maxBytes: 20 * 1024 * 1024,
  allowed: ["image", "pdf", "office"],
};

export type UploadResult =
  | { ok: true; buffer: Buffer; detected: DetectedFile; name: string }
  | { ok: false; error: string };

/** Safe display name: no path parts, no control characters. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\/]/).pop() ?? "file";
  return base.replace(/[\u0000-\u001f"<>:|?*]/g, "_").slice(0, 120) || "file";
}

export async function validateUpload(file: File, rules: UploadRules): Promise<UploadResult> {
  const name = sanitizeFileName(file.name);
  if (file.size === 0) return { ok: false, error: `${name} is empty.` };
  if (file.size > rules.maxBytes)
    return { ok: false, error: `${name} is larger than ${Math.round(rules.maxBytes / 1048576)} MB.` };

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > rules.maxBytes) return { ok: false, error: `${name} is too large.` };

  const detected = detectFile(buffer, name);
  if (!detected || !rules.allowed.includes(detected.kind))
    return { ok: false, error: `${name} is not an allowed file type.` };

  return { ok: true, buffer, detected, name };
}
