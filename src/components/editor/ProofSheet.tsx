"use client";

import { Button } from "@/components/ui/Button";
import { CropMarksHost } from "@/components/ui/CropMarks";
import { FrameNo } from "@/components/ui/FrameNo";
import { IconClose, IconDownload, IconShare } from "@/components/ui/icons";
import { StoryPreview } from "@/components/StoryFrame";
import type { StoryDoc } from "@/lib/types";

type ProofSheetProps = {
  open: boolean;
  busy: boolean;
  error: string | null;
  emptyPhotoSlots: number;
  doc: StoryDoc;
  frameIndex: number;
  title: string;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
};

export function ProofSheet({
  open,
  busy,
  error,
  emptyPhotoSlots,
  doc,
  frameIndex,
  title,
  onClose,
  onDownload,
  onShare,
}: ProofSheetProps) {
  if (!open) return null;

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div
      className="editor-shell fixed inset-0 z-50 grid items-end bg-table/70 sm:place-items-center sm:p-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Пруф-лист експорту"
        className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[12px] border-t border-rule-strong bg-proof p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-proof-ink shadow-[0_16px_40px_-12px_#000000A6] pane-rise sm:max-w-md sm:rounded-[4px] sm:border sm:pb-6"
        style={{ animationDuration: "var(--duration-proof)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl tracking-tight">Пруф-лист</p>
            <div className="mt-1 flex items-center gap-2">
              <FrameNo index={frameIndex} className="!text-proof-ink/55" />
              <span className="text-sm text-proof-ink/70">{title || "Без назви"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="-m-2 flex h-11 w-11 items-center justify-center text-proof-ink/50 hover:text-proof-ink"
          >
            <IconClose />
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <CropMarksHost always className="w-[min(160px,28dvh)]">
            <StoryPreview doc={doc} className="rounded-[4px]" />
          </CropMarksHost>
        </div>

        <p className="data-mono mt-4 text-center text-proof-ink/55">
          PNG · 1080×1920 · sRGB
        </p>

        {emptyPhotoSlots > 0 ? (
          <p className="micro-mono mt-3 border-l-2 border-signal pl-3 text-proof-ink/70">
            Порожніх слотів під фото: {emptyPhotoSlots}. У PNG вони лишаться
            порожніми.
          </p>
        ) : null}

        {error ? (
          <p className="micro-mono mt-3 border-l-2 border-danger pl-3 text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid gap-2">
          {canShare ? (
            <Button
              variant="signal"
              disabled={busy}
              onClick={onShare}
              className="min-h-12 w-full !text-proof sm:min-h-0"
            >
              <IconShare className="h-4 w-4" />
              {busy ? "Готуємо…" : "Поділитись"}
            </Button>
          ) : null}
          <Button
            variant={canShare ? "quiet" : "signal"}
            disabled={busy}
            onClick={onDownload}
            className={`min-h-12 w-full sm:min-h-0 ${canShare ? "!border-proof-ink/20 !bg-proof-ink/5 !text-proof-ink" : "!text-proof"}`}
          >
            <IconDownload className="h-4 w-4" />
            {busy ? "Готуємо…" : "Завантажити PNG"}
          </Button>
        </div>
      </div>
    </div>
  );
}
