import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { isProActive, PRO_LABELS, type ProPlan } from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      payments: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect("/login?next=/account");
  }

  const pro = isProActive(user.subscription?.expiresAt);
  const plan = user.subscription?.plan as ProPlan | undefined;

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-12 md:px-10">
        <Label tone="signal">Акаунт</Label>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Ваш профіль</h1>
        <p className="mt-3 text-ash">Дані входу та статус Kadr Pro.</p>

        <section className="mt-10 space-y-0 border border-rule bg-bench">
          <Row label="Email" value={user.email} />
          <Row label="Імʼя" value={user.name || "—"} />
          <Row
            label="Роль"
            value={user.role === "ADMIN" ? "Адмін" : "Користувач"}
          />
          <Row
            label="Реєстрація"
            value={user.createdAt.toLocaleDateString("uk-UA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            last
          />
        </section>

        <section className="mt-6 border border-rule bg-bench p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="micro-mono text-ash">Підписка</p>
              <p className="mt-1 font-display text-2xl tracking-tight">
                {pro ? (
                  <span className="text-ok">Kadr Pro</span>
                ) : (
                  <span className="text-ash">Безкоштовний план</span>
                )}
              </p>
              {pro && user.subscription ? (
                <p className="mt-2 text-sm text-ash">
                  {plan ? PRO_LABELS[plan] : "Pro"} · до{" "}
                  {user.subscription.expiresAt.toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              ) : (
                <p className="mt-2 text-sm text-ash">
                  Відкритий пак «Воля». Решта паків — у Pro.
                </p>
              )}
            </div>
            <Link href="/pro">
              <Button variant={pro ? "quiet" : "signal"}>
                {pro ? "Продовжити Pro" : "Оформити Pro"}
              </Button>
            </Link>
          </div>
        </section>

        {user.payments.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 font-display text-xl tracking-tight">Останні оплати</h2>
            <div className="border border-rule">
              {user.payments.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex flex-wrap items-center justify-between gap-2 bg-bench px-4 py-3 text-sm ${
                    i < user.payments.length - 1 ? "border-b border-rule" : ""
                  }`}
                >
                  <span className="text-ash">
                    {p.createdAt.toLocaleDateString("uk-UA")} ·{" "}
                    {PRO_LABELS[p.plan as ProPlan] ?? p.plan}
                  </span>
                  <span className="data-mono">{(p.amountKop / 100).toFixed(0)} ₴</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/editor">
            <Button variant="quiet">До редактора</Button>
          </Link>
          {user.role === "ADMIN" ? (
            <Link href="/admin">
              <Button variant="ghost">Адмінка</Button>
            </Link>
          ) : null}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="ghost">
              Вийти
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 ${
        last ? "" : "border-b border-rule"
      }`}
    >
      <span className="micro-mono text-ash">{label}</span>
      <span className="text-sm text-bone">{value}</span>
    </div>
  );
}
