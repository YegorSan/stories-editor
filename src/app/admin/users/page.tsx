import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { Label } from "@/components/ui/Label";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      subscription: true,
      _count: { select: { payments: true } },
    },
  });

  const now = new Date();

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 py-10 md:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label tone="signal">Admin</Label>
            <h1 className="mt-2 font-display text-3xl tracking-tight">Користувачі</h1>
          </div>
          <Link href="/admin" className="text-sm text-ash hover:text-bone">
            ← Огляд
          </Link>
        </div>

        <form className="mb-4">
          <input
            name="q"
            defaultValue={query}
            placeholder="Пошук email…"
            className="w-full max-w-md border border-rule bg-slab px-3 py-2 text-sm outline-none focus:border-rule-strong"
          />
        </form>

        <div className="overflow-x-auto border border-rule">
          <table className="w-full text-left text-sm">
            <thead className="bg-slab text-ash">
              <tr>
                <th className="px-3 py-2 font-normal">Email</th>
                <th className="px-3 py-2 font-normal">Роль</th>
                <th className="px-3 py-2 font-normal">Pro до</th>
                <th className="px-3 py-2 font-normal">Платежі</th>
                <th className="px-3 py-2 font-normal">Реєстрація</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-rule">
                  <td className="px-3 py-2">
                    <Link href={`/admin/users/${u.id}`} className="hover:text-signal">
                      {u.email}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-ash">{u.role}</td>
                  <td className="px-3 py-2 text-ash">
                    {u.subscription && u.subscription.expiresAt > now
                      ? u.subscription.expiresAt.toLocaleDateString("uk-UA")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-ash">{u._count.payments}</td>
                  <td className="px-3 py-2 text-ash">
                    {u.createdAt.toLocaleDateString("uk-UA")}
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
