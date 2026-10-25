import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { Label } from "@/components/ui/Label";
import { GrantProForm } from "@/components/admin/GrantProForm";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!user) notFound();

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 py-10 md:px-10">
        <Link href="/admin/users" className="text-sm text-ash hover:text-bone">
          ← Користувачі
        </Link>
        <div className="mt-4">
          <Label tone="signal">Користувач</Label>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{user.email}</h1>
          <p className="mt-1 text-sm text-ash">
            {user.role} · з {user.createdAt.toLocaleString("uk-UA")}
            {user.name ? ` · ${user.name}` : null}
          </p>
        </div>

        <section className="mt-8 max-w-lg border border-rule bg-bench p-5">
          <h2 className="font-display text-xl">Pro</h2>
          <p className="mt-2 text-sm text-ash">
            Зараз:{" "}
            {user.subscription
              ? `${user.subscription.plan} до ${user.subscription.expiresAt.toLocaleString("uk-UA")}`
              : "немає підписки"}
          </p>
          <div className="mt-4">
            <GrantProForm userId={user.id} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl">Платежі</h2>
          <div className="overflow-x-auto border border-rule">
            <table className="w-full text-left text-sm">
              <thead className="bg-slab text-ash">
                <tr>
                  <th className="px-3 py-2 font-normal">Дата</th>
                  <th className="px-3 py-2 font-normal">План</th>
                  <th className="px-3 py-2 font-normal">Статус</th>
                  <th className="px-3 py-2 font-normal">₴</th>
                  <th className="px-3 py-2 font-normal">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {user.payments.map((p) => (
                  <tr key={p.id} className="border-t border-rule">
                    <td className="px-3 py-2 text-ash">
                      {p.createdAt.toLocaleString("uk-UA")}
                    </td>
                    <td className="px-3 py-2">{p.plan}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{(p.amountKop / 100).toFixed(0)}</td>
                    <td className="px-3 py-2 micro-mono text-xs text-ash">
                      {p.monoInvoiceId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
