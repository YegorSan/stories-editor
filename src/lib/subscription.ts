import { prisma } from "@/lib/db";
import {
  PRO_DURATION_MS,
  isProActive,
  type ProPlan,
} from "@/lib/commerce";

export async function getSubscriptionForUser(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function userHasPro(userId: string): Promise<boolean> {
  const sub = await getSubscriptionForUser(userId);
  return isProActive(sub?.expiresAt);
}

/** Extend Pro from max(now, current expiresAt) by plan duration. Idempotent caller must check payment. */
export async function grantProAccess(userId: string, plan: ProPlan) {
  const existing = await getSubscriptionForUser(userId);
  const base = Math.max(Date.now(), existing?.expiresAt.getTime() ?? 0);
  const expiresAt = new Date(base + PRO_DURATION_MS[plan]);

  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan, expiresAt },
    update: { plan, expiresAt },
  });
}

export async function setProExpiresAt(userId: string, expiresAt: Date, plan: ProPlan = "MONTH") {
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan, expiresAt },
    update: { plan, expiresAt },
  });
}
