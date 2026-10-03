import { Role } from "@/generated/prisma/enums";

/**
 * Granular permissions. Roles are bundles of these; a user can also hold extra
 * individual permissions (User.extraPermissions) on top of their role.
 */
export const PERMISSIONS = [
  "dashboard:view",
  "lead:view",
  "lead:edit",
  "lead:assign",
  "lead:note",
  "lead:followup",
  "lead:delete",
  "lead:export",
  "quote:view",
  "quote:manage",
  "quote:send",
  "project:view",
  "project:manage",
  "service:view",
  "service:manage",
  "industry:manage",
  "testimonial:manage",
  "content:manage",
  "seo:manage",
  "settings:manage",
  "media:view",
  "media:manage",
  "document:manage",
  "user:view",
  "user:manage",
  "audit:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: readonly Permission[] = PERMISSIONS;

const VIEW_ONLY: Permission[] = [
  "dashboard:view",
  "lead:view",
  "quote:view",
  "project:view",
  "service:view",
  "media:view",
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL,
  SALES: [
    "dashboard:view",
    "lead:view",
    "lead:edit",
    "lead:note",
    "lead:followup",
    "quote:view",
    "quote:manage",
    "quote:send",
    "service:view",
    "media:view",
  ],
  PROJECT_MANAGER: [
    "dashboard:view",
    "project:view",
    "project:manage",
    "service:view",
    "media:view",
    "media:manage",
  ],
  CONTENT_MANAGER: [
    "dashboard:view",
    "service:view",
    "service:manage",
    "industry:manage",
    "project:view",
    "project:manage",
    "testimonial:manage",
    "content:manage",
    "seo:manage",
    "media:view",
    "media:manage",
    "document:manage",
  ],
  VIEWER: VIEW_ONLY,
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  PROJECT_MANAGER: "Project Manager",
  CONTENT_MANAGER: "Content Manager",
  VIEWER: "Viewer",
};

export function permissionsFor(role: Role, extra: readonly string[] = []): Set<Permission> {
  const set = new Set<Permission>(ROLE_PERMISSIONS[role]);
  for (const p of extra) if ((PERMISSIONS as readonly string[]).includes(p)) set.add(p as Permission);
  return set;
}

export function can(
  user: { role: Role; extraPermissions?: readonly string[] },
  permission: Permission,
): boolean {
  return permissionsFor(user.role, user.extraPermissions).has(permission);
}
