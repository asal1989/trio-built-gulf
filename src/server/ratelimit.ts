import "server-only";
import { db } from "./db";

/**
 * Fixed-window rate limiter backed by Postgres, so it holds across restarts and
 * across instances. Returns whether the call is allowed.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  const row = await db.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });
    if (!existing || existing.resetAt <= now) {
      return tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
    }
    return tx.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  });

  const retryAfter = Math.max(0, Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000));
  return { allowed: row.count <= limit, remaining: Math.max(0, limit - row.count), retryAfter };
}

export async function clearRateLimit(key: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key } });
}

/** Housekeeping — safe to call occasionally. */
export async function purgeExpiredRateLimits(): Promise<void> {
  await db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });
}
