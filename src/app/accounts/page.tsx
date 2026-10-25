import Link from "next/link";
import { Label } from "@/components/ui/Label";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function AccountsPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-table text-bone">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-28 md:px-10">
        <section className="border-b border-rule py-12 md:py-16">
          <Label tone="signal">Експорт</Label>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">
            Як викласти сторіс
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ash">
            Токен Instagram сюди вставляти не треба і не можна. Ключ від акаунта
            не повинен лежати в браузері.
          </p>
        </section>

        <ol className="mt-8 space-y-0 border border-rule">
          <li className="border-b border-rule bg-bench p-6">
            <p className="label-condensed text-signal">1 · Телефон</p>
            <p className="mt-2 font-display text-2xl tracking-tight">Поділитись</p>
            <p className="mt-2 leading-relaxed text-ash">
              У редакторі натисни «Екс» → «Поділитись». Система відкриє меню,
              обери Instagram — сторіс піде як звичайне фото 1080×1920.
            </p>
          </li>
          <li className="border-b border-rule bg-bench p-6">
            <p className="label-condensed text-signal">2 · Компʼютер</p>
            <p className="mt-2 font-display text-2xl tracking-tight">Завантажити PNG</p>
            <p className="mt-2 leading-relaxed text-ash">
              Скачай кадр з пруф-листа і виклади з телефону. На десктопі
              Instagram не бере сторіс з браузера напряму.
            </p>
          </li>
          <li className="bg-slab p-6">
            <p className="label-condensed text-ash">Пізніше</p>
            <p className="mt-2 font-display text-2xl tracking-tight">Кнопка «Підключити»</p>
            <p className="mt-2 leading-relaxed text-ash">
              Пряма публікація зʼявиться як вхід через Instagram на сервері.
              Токен тоді зберігаємо ми, не ти.
            </p>
          </li>
        </ol>

        <div className="mt-10 border border-rule bg-proof p-6 text-proof-ink">
          <p className="data-mono text-proof-ink/55">PNG · 1080×1920 · sRGB</p>
          <Link
            href="/editor"
            className="mt-4 inline-flex rounded-[2px] bg-signal px-6 py-3.5 font-semibold text-proof transition hover:bg-signal-press"
          >
            Відкрити редактор
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
