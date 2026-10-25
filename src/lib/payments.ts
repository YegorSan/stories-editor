import type { PaymentStatus, Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  mapMonoStatusToPayment,
  type MonoInvoicePayload,
  type MonoInvoiceStatus,
} from "@/lib/mono";
import { grantProAccess } from "@/lib/subscription";

/**
 * Apply a Monobank invoice status to our Payment row.
 * Grants Pro only once when transitioning into SUCCESS.
 */
export async function applyMonoInvoiceUpdate(payload: MonoInvoicePayload) {
  const payment = await prisma.payment.findUnique({
    where: { monoInvoiceId: payload.invoiceId },
  });
  if (!payment) {
    return { ok: false as const, reason: "payment_not_found" as const };
  }

  const nextStatus = mapMonoStatusToPayment(payload.status as MonoInvoiceStatus);

  // Prefer fresher modifiedDate when racing webhooks; if missing, always apply.
  // We store nothing about modifiedDate yet — SUCCESS is sticky once set.
  if (payment.status === "SUCCESS") {
    return { ok: true as const, payment, alreadyPaid: true as const };
  }

  const shouldGrant = nextStatus === "SUCCESS";
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: nextStatus as PaymentStatus,
      paidAt: shouldGrant ? new Date() : payment.paidAt,
    },
  });

  if (shouldGrant) {
    await grantProAccess(payment.userId, payment.plan as Plan);
  }

  return { ok: true as const, payment: updated, alreadyPaid: false as const };
}
