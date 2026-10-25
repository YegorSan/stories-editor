import { CropMarksHost } from "@/components/ui/CropMarks";
import { Label } from "@/components/ui/Label";
import { SiteHeader } from "@/components/SiteHeader";
import { StickerMark } from "@/components/StickerMark";
import { STICKER_PACKS } from "@/lib/stickers";

export default function StickersPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-table text-bone">
      <SiteHeader />
      <main className="px-5 pb-28 md:px-10">
        <section className="border-b border-rule py-12 md:py-16">
          <Label tone="signal">Бібліотека</Label>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">
            Набори стікерів
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash">
            Воля — український пак: прапор, тризуб, калина, вишиванка й цитати.
            Поруч колаж, сад, неон і дроп — щоб зібрати кадр, а не наліпити зірки.
          </p>
        </section>

        <div className="mt-10 space-y-12">
          {STICKER_PACKS.map((pack) => (
            <section key={pack.id} id={pack.id} className="scroll-mt-8">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-rule pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2"
                      style={{ background: pack.accent }}
                      aria-hidden
                    />
                    <h2 className="font-display text-3xl tracking-tight">{pack.name}</h2>
                  </div>
                  <p className="mt-1 text-ash">{pack.tagline}</p>
                </div>
                <p className="data-mono text-ash">{pack.stickers.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-0 border border-rule sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {pack.stickers.map((sticker) => (
                  <CropMarksHost
                    key={sticker.id}
                    className="border-b border-r border-rule bg-bench p-4"
                  >
                    <StickerMark id={sticker.id} className="aspect-square" />
                    <p className="micro-mono mt-2 truncate text-ash">{sticker.name}</p>
                  </CropMarksHost>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
