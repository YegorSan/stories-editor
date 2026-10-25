"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ProPlan } from "@/lib/commerce";

export function GrantProForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<ProPlan>("MONTH");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function grant() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/grant-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });
      const data = (await res.json()) as { error?: string; expiresAt?: string };
      if (!res.ok) {
        setMessage(data.error || "Помилка");
        return;
      }
      setMessage(
        data.expiresAt
          ? `Pro до ${new Date(data.expiresAt).toLocaleString("uk-UA")}`
          : "OK",
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/grant-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, revoke: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error || "Помилка");
        return;
      }
      setMessage("Pro знято");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as ProPlan)}
          className="border border-rule bg-slab px-2 py-2 text-sm"
        >
          <option value="MONTH">+1 місяць</option>
          <option value="YEAR">+1 рік</option>
        </select>
        <Button variant="signal" disabled={busy} onClick={() => void grant()}>
          Видати Pro
        </Button>
        <Button variant="danger" disabled={busy} onClick={() => void revoke()}>
          Зняти Pro
        </Button>
      </div>
      {message ? <p className="text-sm text-ash">{message}</p> : null}
    </div>
  );
}
