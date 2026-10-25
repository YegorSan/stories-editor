"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import {
  PRO_LABELS,
  PRO_PRICES_UAH,
  formatUah,
  type ProPlan,
} from "@/lib/commerce";
import { useProAccess } from "@/hooks/useProAccess";

export function ProCheckout() {
  const { status } = useSession();
  const { pro, expiresAt, refresh } = useProAccess();
  const [busy, setBusy] = useState<ProPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(plan: ProPlan) {
    setError(null);
    if (status !== "authenticated") {
      window.location.href = `/login?next=${encodeURIComponent("/pro")}`;
      return;
    }
    setBusy(plan);
    track("checkout_started", { plan, source: "pro_page" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { pageUrl?: string; error?: string };
      if (!res.ok || !data.pageUrl) {
        setError(data.error || "Не вдалося створити рахунок");
        return;
      }
      window.location.href = data.pageUrl;
    } catch {
      setError("Мережева помилка");
    } finally {
      setBusy(null);
      void refresh();
    }
  }

  return (
    <div className="space-y-8">
      {pro && expiresAt ? (
        <div className="border border-ok/40 bg-ok/10 px-4 py-3 text-sm text-bone">
          У вас активний <span className="text-ok">Kadr Pro</span> до{" "}
          {new Date(expiresAt).toLocaleDateString("uk-UA")}. Можна продовжити
          заздалегідь — термін додасться до поточної дати.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(["MONTH", "YEAR"] as ProPlan[]).map((plan) => (
          <div key={plan} className="flex flex-col border border-rule bg-bench p-6">
            <p className="label-condensed text-ash">{PRO_LABELS[plan]}</p>
            <p className="mt-2 font-display text-4xl tracking-tight">
              {formatUah(PRO_PRICES_UAH[plan])}
            </p>
            <p className="mt-3 flex-1 text-sm text-ash">
              {plan === "YEAR"
                ? "Усі преміум-паки на рік. Вигідніше за помісячну оплату."
                : "Усі преміум-паки на 30 днів. Скасувати нічого не треба — просто не продовжуйте."}
            </p>
            <Button
              variant={plan === "YEAR" ? "signal" : "quiet"}
              className="mt-6 w-full"
              disabled={busy !== null}
              onClick={() => void buy(plan)}
            >
              {busy === plan ? "Створюємо рахунок…" : "Оплатити в Monobank"}
            </Button>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <p className="text-sm text-ash">
        Безкоштовно: редактор і пак «Воля». Деталі в{" "}
        <Link href="/legal/terms" className="text-bone underline-offset-2 hover:underline">
          оферті
        </Link>
        .
      </p>
    </div>
  );
}
