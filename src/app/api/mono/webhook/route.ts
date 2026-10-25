import { NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics-server";
import { verifyMonoWebhookSign, type MonoInvoicePayload } from "@/lib/mono";
import { applyMonoInvoiceUpdate } from "@/lib/payments";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const xSign = req.headers.get("X-Sign");

  const valid = await verifyMonoWebhookSign(rawBody, xSign);
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: MonoInvoicePayload;
  try {
    payload = JSON.parse(rawBody) as MonoInvoicePayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!payload.invoiceId || !payload.status) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const result = await applyMonoInvoiceUpdate(payload);
  if (!result.ok) {
    // Acknowledge so Mono stops retrying unknown invoices from other envs.
    return NextResponse.json({ ok: true, skipped: result.reason });
  }

  if (payload.status === "success" && !result.alreadyPaid) {
    await captureServerEvent({
      distinctId: result.payment.userId,
      event: "payment_success",
      properties: {
        plan: result.payment.plan,
        amountKop: result.payment.amountKop,
        invoiceId: payload.invoiceId,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
