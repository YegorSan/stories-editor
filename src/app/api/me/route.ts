import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isProActive } from "@/lib/commerce";
import { getSubscriptionForUser } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null, pro: false, expiresAt: null });
  }

  const sub = await getSubscriptionForUser(session.user.id);
  const pro = isProActive(sub?.expiresAt);

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
    pro,
    expiresAt: sub?.expiresAt?.toISOString() ?? null,
    plan: sub?.plan ?? null,
  });
}
