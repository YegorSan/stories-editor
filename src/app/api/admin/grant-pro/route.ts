import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { grantProAccess, setProExpiresAt } from "@/lib/subscription";
import type { ProPlan } from "@/lib/commerce";

const bodySchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["MONTH", "YEAR"]).optional(),
  revoke: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (parsed.data.revoke) {
    await setProExpiresAt(user.id, new Date(0), "MONTH");
    return NextResponse.json({ ok: true, expiresAt: new Date(0).toISOString() });
  }

  const plan = (parsed.data.plan || "MONTH") as ProPlan;
  const sub = await grantProAccess(user.id, plan);
  return NextResponse.json({ ok: true, expiresAt: sub.expiresAt.toISOString() });
}
