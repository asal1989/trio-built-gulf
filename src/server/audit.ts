import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { clientInfo } from "./request";

export type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
  meta?: Prisma.InputJsonValue;
};

/** Never throws — a failed audit write must not break the user's action. */
export async function audit(input: AuditInput): Promise<void> {
  try {
    const { ip, userAgent } = await clientInfo().catch(() => ({ ip: null, userAgent: null }));
    await db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        summary: input.summary.slice(0, 500),
        meta: input.meta,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("audit write failed", error);
  }
}
