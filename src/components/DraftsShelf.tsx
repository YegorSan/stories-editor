"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CropMarksHost } from "@/components/ui/CropMarks";
import { FrameNo } from "@/components/ui/FrameNo";
import { Label } from "@/components/ui/Label";
import { StoryPreview } from "@/components/StoryFrame";
import { DRAFTS_EVENT, deleteDraft, listDrafts, type StoryDraft } from "@/lib/drafts";

export function DraftsShelf() {
  const [drafts, setDrafts] = useState<StoryDraft[] | null>(null);

  useEffect(() => {
    const refresh = () => {
      void listDrafts()
        .then(setDrafts)
        .catch(() => setDrafts([]));
    };
    refresh();
    window.addEventListener(DRAFTS_EVENT, refresh);
    return () => window.removeEventListener(DRAFTS_EVENT, refresh);
  }, []);

  if (!drafts || drafts.length === 0) return null;

  return (
    <section className="mt-10 border-t border-rule pt-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl tracking-tight md:text-4xl">Мої кадри</h2>
        <p className="micro-mono text-ash">зберігаються на цьому пристрої</p>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
        {drafts.map((draft, index) => (
          <article key={draft.id} className="group">
            <Link href={`/editor?draft=${draft.id}`}>
              <CropMarksHost className="overflow-hidden rounded-[4px]">
                <StoryPreview doc={draft.doc} className="rounded-[4px]" />
              </CropMarksHost>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <FrameNo index={index + 1} pad={2} className="group-hover:text-signal" />
                <p className="truncate text-sm tracking-tight text-bone">
                  {draft.title || "Без назви"}
                </p>
              </div>
            </Link>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="micro-mono text-ash">
                {new Date(draft.updatedAt).toLocaleString("uk-UA", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <button
                type="button"
                onClick={() => void deleteDraft(draft.id)}
                className="micro-mono text-danger hover:underline"
              >
                Видалити
              </button>
            </div>
          </article>
        ))}
      </div>
      <Label className="mt-6">Контакт-лист чернеток</Label>
    </section>
  );
}
