import Link from "next/link";
import { CropMarksHost } from "@/components/ui/CropMarks";
import { Label } from "@/components/ui/Label";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickerMark } from "@/components/StickerMark";
import { isFreePack } from "@/lib/commerce";
import { STICKER_PACKS } from "@/lib/stickers";

export default function StickersPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-table text-bone">
      <SiteHeader />
      <main className="px-5 pb-16 md:px-10">
        <section className="border-b border-rule py-12 md:py-16">
          <Label tone="signal">Бібліотека</Label>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">
            Набори стікерів
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash">
            Воля — безкоштовний український пак. Колаж, сад, неон і дроп — у{" "}
            <Link href="/pro" className="text-bone underline-offset-2 hover:underline">
              Kadr Pro
            </Link>
            .
          </p>
        </section>

        <div className="mt-10 space-y-12">
          {STICKER_PACKS.map((pack) => {
            const free = isFreePack(pack.id);
            return (
              <section key={pack.id} id={pack.id} className="scroll-mt-8">
                <div className="mb-6 flex items-end justify-between gap-4 border-b border-rule pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="h-2 w-2"
                        style={{ background: pack.accent }}
                        aria-hidden
                      />
                      <h2 className="font-display text-3xl tracking-tight">{pack.name}</h2>
                      <span
                        className={`micro-mono border px-1.5 py-0.5 text-[9px] ${
                          free
                            ? "border-ok/40 text-ok"
                            : "border-signal/40 text-signal"
                        }`}
                      >
                        {free ? "Безкоштовно" : "Pro"}
                      </span>
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
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
