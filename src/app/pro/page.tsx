import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Label } from "@/components/ui/Label";
import { ProCheckout } from "@/components/pro/ProCheckout";

export default function ProPage() {
  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 pb-20 pt-12 md:px-10 md:pt-16">
        <section className="mx-auto max-w-3xl">
          <Label tone="signal">Kadr Pro</Label>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            Усі стікер-паки в одному доступі
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash">
            Пак «Воля» завжди безкоштовний. Pro відкриває Колаж, Сад, Неон і Дроп —
            поки підписка активна. Оплата через Monobank, без App Store.
          </p>
          <div className="mt-10">
            <ProCheckout />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
