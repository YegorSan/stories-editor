import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { captureServerEvent } from "@/lib/analytics-server";
import { PRO_PRICES_UAH, uahToKop, type ProPlan } from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { createMonoInvoice } from "@/lib/mono";

const bodySchema = z.object({
  plan: z.enum(["MONTH", "YEAR"]),
});

function originFrom(req: Request): string {
  const env = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return url.origin;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Увійдіть, щоб оплатити Pro" }, { status: 401 });
  }

  if (!process.env.MONO_TOKEN) {
    return NextResponse.json(
      { error: "Оплата тимчасово недоступна (немає MONO_TOKEN)" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Невірний запит" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Оберіть план MONTH або YEAR" }, { status: 400 });
  }

  const plan = parsed.data.plan as ProPlan;
  const origin = originFrom(req);
  const amountKop = uahToKop(PRO_PRICES_UAH[plan]);

  // Placeholder invoice id until Mono responds — use a temp unique ref.
  const reference = `kadr-${session.user.id.slice(0, 8)}-${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      plan,
      amountKop,
      monoInvoiceId: `pending-${reference}`,
      status: "CREATED",
    },
  });

  try {
    const invoice = await createMonoInvoice({
      plan,
      reference: payment.id,
      redirectUrl: `${origin}/pro/return?paymentId=${payment.id}`,
      webHookUrl: `${origin}/api/mono/webhook`,
      customerEmail: session.user.email,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { monoInvoiceId: invoice.invoiceId },
    });

    await captureServerEvent({
      distinctId: session.user.id,
      event: "checkout_started",
      properties: { plan, amountKop, paymentId: payment.id },
    });

    return NextResponse.json({
      pageUrl: invoice.pageUrl,
      paymentId: payment.id,
      invoiceId: invoice.invoiceId,
    });
  } catch (err) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILURE" },
    });
    const message = err instanceof Error ? err.message : "Помилка Monobank";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
