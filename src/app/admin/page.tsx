import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { Label } from "@/components/ui/Label";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();
  const [
    usersTotal,
    regs7,
    regs30,
    activePro,
    revenueMonth,
    recentUsers,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.user.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.subscription.count({ where: { expiresAt: { gt: now } } }),
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        paidAt: { gte: daysAgo(30) },
      },
      _sum: { amountKop: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { subscription: true, _count: { select: { payments: true } } },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const revenueUah = ((revenueMonth._sum.amountKop ?? 0) / 100).toFixed(0);

  const kpis = [
    { label: "Користувачі", value: String(usersTotal) },
    { label: "Реєстрації 7д", value: String(regs7) },
    { label: "Реєстрації 30д", value: String(regs30) },
    { label: "Активні Pro", value: String(activePro) },
    { label: "Виручка 30д", value: `${revenueUah} ₴` },
  ];

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 py-10 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label tone="signal">Admin</Label>
            <h1 className="mt-2 font-display text-3xl tracking-tight">Огляд</h1>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/users" className="text-ash hover:text-bone">
              Користувачі
            </Link>
            <Link href="/admin/payments" className="text-ash hover:text-bone">
              Платежі
            </Link>
          </nav>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="border border-rule bg-bench p-4">
              <p className="micro-mono text-ash">{kpi.label}</p>
              <p className="mt-2 font-display text-3xl tracking-tight">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 font-display text-xl">Нові користувачі</h2>
            <div className="overflow-x-auto border border-rule">
              <table className="w-full text-left text-sm">
                <thead className="bg-slab text-ash">
                  <tr>
                    <th className="px-3 py-2 font-normal">Email</th>
                    <th className="px-3 py-2 font-normal">Pro</th>
                    <th className="px-3 py-2 font-normal">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-t border-rule">
                      <td className="px-3 py-2">
                        <Link href={`/admin/users/${u.id}`} className="hover:text-signal">
                          {u.email}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-ash">
                        {u.subscription && u.subscription.expiresAt > now ? "так" : "—"}
                      </td>
                      <td className="px-3 py-2 text-ash">
                        {u.createdAt.toLocaleDateString("uk-UA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl">Останні платежі</h2>
            <div className="overflow-x-auto border border-rule">
              <table className="w-full text-left text-sm">
                <thead className="bg-slab text-ash">
                  <tr>
                    <th className="px-3 py-2 font-normal">Email</th>
                    <th className="px-3 py-2 font-normal">План</th>
                    <th className="px-3 py-2 font-normal">Статус</th>
                    <th className="px-3 py-2 font-normal">₴</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="border-t border-rule">
                      <td className="px-3 py-2">{p.user.email}</td>
                      <td className="px-3 py-2 text-ash">{p.plan}</td>
                      <td className="px-3 py-2 text-ash">{p.status}</td>
                      <td className="px-3 py-2">{(p.amountKop / 100).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
