import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { Label } from "@/components/ui/Label";

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true, id: true } } },
  });

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 py-10 md:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label tone="signal">Admin</Label>
            <h1 className="mt-2 font-display text-3xl tracking-tight">Платежі</h1>
          </div>
          <Link href="/admin" className="text-sm text-ash hover:text-bone">
            ← Огляд
          </Link>
        </div>

        <div className="overflow-x-auto border border-rule">
          <table className="w-full text-left text-sm">
            <thead className="bg-slab text-ash">
              <tr>
                <th className="px-3 py-2 font-normal">Дата</th>
                <th className="px-3 py-2 font-normal">Email</th>
                <th className="px-3 py-2 font-normal">План</th>
                <th className="px-3 py-2 font-normal">Статус</th>
                <th className="px-3 py-2 font-normal">₴</th>
                <th className="px-3 py-2 font-normal">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-rule">
                  <td className="px-3 py-2 text-ash">
                    {p.createdAt.toLocaleString("uk-UA")}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/users/${p.user.id}`}
                      className="hover:text-signal"
                    >
                      {p.user.email}
                    </Link>
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
      </main>
    </div>
  );
}
