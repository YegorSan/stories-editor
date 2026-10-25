# Kadr — редактор Instagram Stories

Збираєш сторіс 9:16 з власних стікер-паків і шаблонів, експортуєш PNG 1080×1920.
**Kadr Pro** відкриває преміум-паки (оплата через Monobank).

Стек: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma, Auth.js, PostgreSQL.

## Швидкий старт

```bash
cp .env.example .env
npm install
# Docker Desktop має бути запущений (WSL integration або Windows CLI)
npm run db:up                 # Postgres у Docker
npx prisma migrate deploy     # схема
npm run db:seed               # адмін з ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

Якщо `docker` не видно в WSL — `npm run db:up` спробує `docker.exe` з Docker Desktop.

Далі [http://localhost:3000](http://localhost:3000).

Адмінка: [http://localhost:3000/admin](http://localhost:3000/admin) (після логіну адміном).

## Kadr Pro

| | |
| --- | --- |
| Безкоштовно | Редактор + пак «Воля» (`ua`) |
| Pro | Паки Колаж, Сад, Неон, Дроп |
| Ціни | 149 ₴ / місяць · 999 ₴ / рік (`src/lib/commerce.ts`) |
| Оплата | Monobank invoice → webhook → `Subscription.expiresAt` |

Підключення еквайрингу: [docs/MONO_SETUP.md](docs/MONO_SETUP.md).

Змінні середовища: [.env.example](.env.example).

## Сторінки

| Шлях | Що робить |
| --- | --- |
| `/` | Вітрина |
| `/stickers` | Бібліотека паків (бейджі Free / Pro) |
| `/editor` | Редактор |
| `/pro` | Тарифи та оплата |
| `/login`, `/register` | Акаунт |
| `/admin` | KPI + користувачі + платежі |
| `/legal/terms`, `/legal/privacy` | Оферта та конфіденційність |

## Команди

```bash
npm run build
npm run lint
npx tsc --noEmit
npm run db:studio
```

## Аналітика

PostHog (опційно): `NEXT_PUBLIC_POSTHOG_KEY`. Події: `register`, `paywall_shown`, `checkout_started`, `payment_success`.

## Публікація в Instagram

Токен Meta у браузер не вводиться. З телефона: «Поділитись» → Instagram. З компʼютера: PNG → телефон.
