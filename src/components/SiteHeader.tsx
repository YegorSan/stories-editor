"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Шаблони" },
  { href: "/stickers", label: "Стікери" },
  { href: "/editor", label: "Редактор" },
  { href: "/pro", label: "Pro" },
  { href: "/accounts", label: "Як викласти" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-rule px-5 py-5 md:px-10">
      <Link
        href="/"
        className="font-display text-[1.65rem] leading-none tracking-tight text-bone transition hover:text-signal"
      >
        Kadr
      </Link>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 transition ${
                active ? "text-bone" : "text-ash hover:text-bone"
              }`}
            >
              {link.label}
              {active ? (
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-signal" />
              ) : null}
            </Link>
          );
        })}
        {isAdmin ? (
          <Link
            href="/admin"
            className={`relative py-1 transition ${
              pathname.startsWith("/admin") ? "text-bone" : "text-ash hover:text-bone"
            }`}
          >
            Admin
          </Link>
        ) : null}
        {status === "authenticated" ? (
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className={`relative py-1 text-xs transition sm:text-sm ${
                pathname.startsWith("/account")
                  ? "text-bone"
                  : "text-ash hover:text-bone"
              }`}
            >
              Акаунт
              {pathname.startsWith("/account") ? (
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-signal" />
              ) : null}
            </Link>
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Вийти
            </Button>
          </div>
        ) : status === "loading" ? (
          <span className="text-xs text-ash">…</span>
        ) : (
          <Link href="/login" className="text-bone hover:text-signal">
            Увійти
          </Link>
        )}
      </nav>
    </header>
  );
}
