import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { captureServerEvent } from "@/lib/analytics-server";

const bodySchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
  name: z.string().trim().max(100).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Невірний запит" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Перевірте email і пароль (мін. 6 символів)" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Користувач із таким email уже є" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name || null,
      },
      select: { id: true, email: true },
    });

    try {
      await captureServerEvent({
        distinctId: user.id,
        event: "register",
        properties: { email: user.email },
      });
    } catch {
      // analytics must not block signup
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error("[register]", err);
    const message = err instanceof Error ? err.message : "DB error";
    const looksLikeMissingTable =
      /does not exist|P2021|P1001|Can't reach database/i.test(message);
    return NextResponse.json(
      {
        error: looksLikeMissingTable
          ? "База ще не готова: виконай prisma migrate deploy на Neon"
          : "Не вдалося створити акаунт. Перевір DATABASE_URL / логи Vercel.",
      },
      { status: 500 },
    );
  }
}
