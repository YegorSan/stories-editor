import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Label } from "@/components/ui/Label";

export default function TermsPage() {
  const name = process.env.NEXT_PUBLIC_FOP_NAME || "Виконавець";
  const edrpou = process.env.NEXT_PUBLIC_FOP_EDRPOU || "—";
  const email = process.env.NEXT_PUBLIC_FOP_EMAIL || "—";

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-10">
        <Label tone="signal">Юридичне</Label>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Публічна оферта</h1>
        <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-ash">
          <p>
            Ця оферта регулює надання доступу до онлайн-сервісу Kadr (редактор Instagram
            Stories та бібліотека стікерів) Виконавцем: <strong className="text-bone">{name}</strong>
            , ІПН/ЄДРПОУ {edrpou}, контакт {email}.
          </p>
          <p>
            <strong className="text-bone">Предмет.</strong> Користувач отримує доступ до
            програмного забезпечення через сайт. Базовий функціонал і пак стікерів «Воля»
            доступні безоплатно. Платний доступ «Kadr Pro» відкриває додаткові стікер-паки
            на обраний строк (місяць або рік).
          </p>
          <p>
            <strong className="text-bone">Оплата.</strong> Платежі приймаються через
            інтернет-еквайринг Monobank. Після успішної оплати доступ Pro активний до дати,
            зазначеної в акаунті. Автопродовження на поточному етапі не застосовується —
            для продовження потрібно оплатити новий період.
          </p>
          <p>
            <strong className="text-bone">Повернення.</strong> Запит на повернення коштів
            надсилайте на {email} протягом 14 днів, якщо Pro-доступ фактично не
            використовувався. Повернення здійснюється згідно з правилами еквайрингу
            Monobank і законодавства України.
          </p>
          <p>
            <strong className="text-bone">Обмеження.</strong> Заборонено зламувати,
            перепродувати доступ, масово вивантажувати ассети стікерів для сторонніх
            продуктів без письмової згоди Виконавця.
          </p>
          <p>
            Користування сервісом означає прийняття цієї оферти. Актуальна редакція завжди
            доступна за адресою /legal/terms.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
