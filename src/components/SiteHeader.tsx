"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Шаблони" },
  { href: "/stickers", label: "Стікери" },
  { href: "/editor", label: "Редактор" },
  { href: "/accounts", label: "Як викласти" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 flex items-center justify-between gap-4 border-b border-rule px-5 py-5 md:px-10">
      <Link
        href="/"
        className="font-display text-[1.65rem] leading-none tracking-tight text-bone transition hover:text-signal"
      >
        Kadr
      </Link>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {links.map((link) => {
          const active = pathname === link.href;
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
      </nav>
    </header>
  );
}
