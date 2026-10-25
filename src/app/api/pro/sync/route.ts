import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMonoInvoiceStatus } from "@/lib/mono";
import { applyMonoInvoiceUpdate } from "@/lib/payments";

const bodySchema = z.object({
  paymentId: z.string().min(1),
});

/** Client return page calls this if webhook is slow. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "paymentId required" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, userId: session.user.id },
  });
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (payment.status === "SUCCESS") {
    return NextResponse.json({ status: payment.status });
  }

  if (payment.monoInvoiceId.startsWith("pending-")) {
    return NextResponse.json({ status: payment.status });
  }

  if (!process.env.MONO_TOKEN) {
    return NextResponse.json({ status: payment.status });
  }

  try {
    const invoice = await getMonoInvoiceStatus(payment.monoInvoiceId);
    const result = await applyMonoInvoiceUpdate(invoice);
    if (result.ok) {
      return NextResponse.json({ status: result.payment.status });
    }
  } catch {
    // fall through
  }

  return NextResponse.json({ status: payment.status });
}
