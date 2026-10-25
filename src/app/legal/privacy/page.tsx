import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Label } from "@/components/ui/Label";

export default function PrivacyPage() {
  const name = process.env.NEXT_PUBLIC_FOP_NAME || "Виконавець";
  const email = process.env.NEXT_PUBLIC_FOP_EMAIL || "—";

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-10">
        <Label tone="signal">Юридичне</Label>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Політика конфіденційності</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ash">
          <p>
            Контролер даних: <strong className="text-bone">{name}</strong>. Питання щодо
            даних — на {email}.
          </p>
          <p>
            <strong className="text-bone">Що збираємо.</strong> Email і хеш пароля для
            акаунта; дані про підписку Pro та платежі (ідентифікатор рахунку Monobank,
            сума, статус); технічні логи та події аналітики (PostHog), якщо ключ аналітики
            увімкнено.
          </p>
          <p>
            <strong className="text-bone">Навіщо.</strong> Надання доступу до сервісу,
            оплата та підтримка, безпека, покращення продукту.
          </p>
          <p>
            <strong className="text-bone">Кому передаємо.</strong> Monobank (обробка
            платежів); хостинг і база даних; PostHog (якщо підключено). Ми не продаємо
            персональні дані.
          </p>
          <p>
            <strong className="text-bone">Зберігання.</strong> Дані акаунта — поки акаунт
            активний; платіжні записи — строк, потрібний для бухгалтерії та спорів.
            Запит на видалення акаунта надсилайте на {email}.
          </p>
          <p>
            <strong className="text-bone">Cookies.</strong> Сесійні cookies для входу;
            PostHog може використовувати cookies аналітики за вашої згоди браузера /
            налаштувань.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
