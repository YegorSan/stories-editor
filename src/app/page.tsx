import Link from "next/link";
import { CropMarksHost } from "@/components/ui/CropMarks";
import { FrameNo } from "@/components/ui/FrameNo";
import { Label } from "@/components/ui/Label";
import { DraftsShelf } from "@/components/DraftsShelf";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryPreview } from "@/components/StoryFrame";
import { StickerMark } from "@/components/StickerMark";
import { STICKER_PACKS } from "@/lib/stickers";
import { TEMPLATES } from "@/lib/templates";

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-table text-bone">
      <SiteHeader />
      <main className="px-5 pb-28 md:px-10">
        <section className="relative isolate grid items-center gap-12 border-b border-rule py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Label tone="signal">Story studio</Label>
            <h1 className="mt-4 max-w-2xl font-display text-[2.75rem] leading-[1.02] tracking-[-0.03em] md:text-6xl lg:text-7xl">
              Сторіс,
              <br />
              <em className="italic text-bone/90">які не зливаються</em>
              <br />
              зі стрічкою
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ash">
              Редактор сторіс 9:16: шаблони, стікери, автозбереження на цьому
              пристрої. З телефона — «Поділитись» в Instagram.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/editor"
                className="inline-flex items-center rounded-[2px] bg-signal px-6 py-3.5 text-[0.95rem] font-semibold text-proof transition hover:bg-signal-press"
              >
                Зібрати кадр
              </Link>
              <Link
                href="/stickers"
                className="inline-flex items-center rounded-[2px] border border-rule bg-slab px-6 py-3.5 text-[0.95rem] text-bone transition hover:border-rule-strong"
              >
                Дивитись стікери
              </Link>
            </div>
          </div>
          <div className="justify-self-center lg:justify-self-end">
            <CropMarksHost always className="w-[220px] md:w-[260px]">
              <div className="rotate-1">
                <StoryPreview
                  doc={TEMPLATES[0].doc}
                  className="rounded-[4px] shadow-[0_40px_90px_-30px_#000000B3]"
                />
              </div>
            </CropMarksHost>
            <p className="mt-3 text-center">
              <FrameNo index={1} pad={2} />
            </p>
          </div>
        </section>

        <DraftsShelf />

        <section className="mt-10 border-t border-rule pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">Шаблони</h2>
            <p className="data-mono text-ash">{TEMPLATES.length} кадрів</p>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {TEMPLATES.map((template, index) => (
              <Link
                key={template.id}
                href={`/editor?template=${template.id}`}
                className="group"
              >
                <CropMarksHost className="overflow-hidden rounded-[4px]">
                  <StoryPreview doc={template.doc} className="rounded-[4px]" />
                </CropMarksHost>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <FrameNo
                    index={index + 1}
                    pad={2}
                    className="group-hover:text-signal"
                  />
                  <p className="truncate text-sm tracking-tight">{template.name}</p>
                </div>
                <p className="label-condensed mt-1 text-[9px] text-ash">
                  {template.category}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-rule pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">Стікер-паки</h2>
            <Label>5 наборів</Label>
          </div>
          <div className="grid gap-0 border border-rule sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {STICKER_PACKS.map((pack, i) => (
              <Link
                key={pack.id}
                href={`/stickers#${pack.id}`}
                className={`bg-bench p-5 transition-colors hover:bg-slab ${
                  i < STICKER_PACKS.length - 1 ? "border-b border-rule lg:border-b-0 lg:border-r" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5"
                    style={{ background: pack.accent }}
                    aria-hidden
                  />
                  <p className="label-condensed text-ash">{pack.name}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {pack.stickers.slice(0, 3).map((sticker) => (
                    <StickerMark key={sticker.id} id={sticker.id} className="aspect-square" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-snug text-ash">{pack.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 border border-rule bg-proof px-6 py-10 text-proof-ink md:px-10">
          <Label tone="proof">Пруф</Label>
          <p className="mt-3 max-w-xl font-display text-3xl tracking-tight">
            Кадр — інструмент, не шаблонний дашборд.
          </p>
          <p className="mt-3 max-w-lg text-proof-ink/70">
            Збери сторіс на монтажному столі: crop marks, frame numbers, пруф-лист
            на експорт.
          </p>
          <Link
            href="/editor"
            className="mt-6 inline-flex rounded-[2px] bg-signal px-5 py-3 text-sm font-semibold text-proof hover:bg-signal-press"
          >
            Відкрити стіл
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
