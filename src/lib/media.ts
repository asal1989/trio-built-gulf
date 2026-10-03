/** Public URL for a stored media object. Served by src/app/media/[...key]/route.ts. */
export const mediaUrl = (storageKey: string) =>
  "/media/" + storageKey.split("/").map(encodeURIComponent).join("/");

export const MEDIA_CATEGORIES = [
  ["PROJECT", "Project photos"],
  ["SERVICE", "Service images"],
  ["TEAM", "Team"],
  ["DOCUMENT", "Company documents"],
  ["CERTIFICATE", "Certificates"],
  ["BROCHURE", "Brochures"],
  ["GENERAL", "General"],
] as const;
