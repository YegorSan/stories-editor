"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  callbackUrl = "/editor",
}: {
  mode: Mode;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error || "Не вдалося зареєструватися");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(mode === "login" ? "Невірний email або пароль" : "Увійдіть не вдалося");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-5 border border-rule bg-bench p-6 md:p-8">
      <div>
        <Label tone="signal">{mode === "login" ? "Вхід" : "Реєстрація"}</Label>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          {mode === "login" ? "Увійти в Kadr" : "Створити акаунт"}
        </h1>
        <p className="mt-2 text-sm text-ash">
          {mode === "login"
            ? "Щоб купити Pro і зберігати доступ на інших пристроях."
            : "Email і пароль — без зайвого. Далі можна оформити Kadr Pro."}
        </p>
      </div>

      {mode === "register" ? (
        <label className="block space-y-1.5">
          <span className="micro-mono text-ash">Імʼя (необовʼязково)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-rule bg-slab px-3 py-2 text-bone outline-none focus:border-rule-strong"
            autoComplete="name"
          />
        </label>
      ) : null}

      <label className="block space-y-1.5">
        <span className="micro-mono text-ash">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-rule bg-slab px-3 py-2 text-bone outline-none focus:border-rule-strong"
          autoComplete="email"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="micro-mono text-ash">Пароль</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-rule bg-slab px-3 py-2 text-bone outline-none focus:border-rule-strong"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" variant="signal" className="w-full" disabled={busy}>
        {busy ? "…" : mode === "login" ? "Увійти" : "Зареєструватися"}
      </Button>

      <p className="text-sm text-ash">
        {mode === "login" ? (
          <>
            Немає акаунта?{" "}
            <Link href="/register" className="text-bone underline-offset-2 hover:underline">
              Реєстрація
            </Link>
          </>
        ) : (
          <>
            Вже є акаунт?{" "}
            <Link href="/login" className="text-bone underline-offset-2 hover:underline">
              Увійти
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
