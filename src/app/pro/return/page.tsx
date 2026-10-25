"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

function ReturnInner() {
  const params = useSearchParams();
  const paymentId = params.get("paymentId");
  const [status, setStatus] = useState<string>("CHECKING");
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      setStatus("MISSING");
      return;
    }

    let cancelled = false;
    let attempt = 0;

    async function syncOnce() {
      attempt += 1;
      setTries(attempt);
      try {
        const res = await fetch("/api/pro/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = (await res.json()) as { status?: string };
        if (cancelled) return;
        const next = data.status || "CREATED";
        setStatus(next);
        if (next === "SUCCESS") {
          track("payment_success", { paymentId, source: "return_page" });
          return true;
        }
        if (next === "FAILURE" || next === "EXPIRED") return true;
      } catch {
        // retry
      }
      return false;
    }

    void (async () => {
      const done = await syncOnce();
      if (done || cancelled) return;
      const timer = window.setInterval(() => {
        void (async () => {
          const finished = await syncOnce();
          if (finished || attempt >= 8) {
            window.clearInterval(timer);
            if (attempt >= 8 && status !== "SUCCESS") {
              setStatus((s) => (s === "CHECKING" ? "PENDING" : s));
            }
          }
        })();
      }, 2000);
      return () => window.clearInterval(timer);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  return (
    <div className="mx-auto max-w-lg space-y-4 border border-rule bg-bench p-6">
      <h1 className="font-display text-3xl tracking-tight">Оплата Pro</h1>
      {status === "SUCCESS" ? (
        <p className="text-ok">Готово. Kadr Pro активовано.</p>
      ) : status === "FAILURE" || status === "EXPIRED" ? (
        <p className="text-danger">Оплату не завершено. Спробуйте ще раз на сторінці Pro.</p>
      ) : status === "MISSING" ? (
        <p className="text-ash">Немає ідентифікатора платежу.</p>
      ) : (
        <p className="text-ash">
          Перевіряємо статус у Monobank… {tries > 0 ? `(спроба ${tries})` : null}
        </p>
      )}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/editor">
          <Button variant="signal">До редактора</Button>
        </Link>
        <Link href="/pro">
          <Button variant="quiet">Сторінка Pro</Button>
        </Link>
      </div>
    </div>
  );
}

export default function ProReturnPage() {
  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 py-12 md:px-10">
        <Suspense fallback={<p className="text-ash">Завантаження…</p>}>
          <ReturnInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
