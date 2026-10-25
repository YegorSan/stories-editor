import Link from "next/link";

export function SiteFooter() {
  const name = process.env.NEXT_PUBLIC_FOP_NAME || "ФОП";
  const edrpou = process.env.NEXT_PUBLIC_FOP_EDRPOU || "";
  const email = process.env.NEXT_PUBLIC_FOP_EMAIL || "";
  const address = process.env.NEXT_PUBLIC_FOP_ADDRESS || "";

  return (
    <footer className="border-t border-rule px-5 py-10 text-sm text-ash md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="font-display text-lg text-bone">Kadr</p>
          <p>Онлайн-редактор сторіс. Доступ Pro — через Monobank.</p>
          <p className="pt-2 text-xs leading-relaxed">
            {name}
            {edrpou ? ` · ІПН/ЄДРПОУ ${edrpou}` : null}
            {address ? ` · ${address}` : null}
            {email ? (
              <>
                {" · "}
                <a href={`mailto:${email}`} className="text-bone hover:text-signal">
                  {email}
                </a>
              </>
            ) : null}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/pro" className="hover:text-bone">
            Pro
          </Link>
          <Link href="/legal/terms" className="hover:text-bone">
            Оферта
          </Link>
          <Link href="/legal/privacy" className="hover:text-bone">
            Конфіденційність
          </Link>
          <Link href="/accounts" className="hover:text-bone">
            Як викласти
          </Link>
        </nav>
      </div>
    </footer>
  );
}
