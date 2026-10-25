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
      className="fixed inset-0 z-50 grid place-items-center bg-table/70 p-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Пруф-лист експорту"
        className="relative w-full max-w-md rounded-[4px] border border-rule-strong bg-proof p-6 text-proof-ink shadow-[0_16px_40px_-12px_#000000A6] pane-rise"
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
            className="text-proof-ink/50 hover:text-proof-ink"
          >
            <IconClose />
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <CropMarksHost always className="w-[160px]">
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
              className="w-full !text-proof"
            >
              <IconShare className="h-4 w-4" />
              {busy ? "Готуємо…" : "Поділитись"}
            </Button>
          ) : null}
          <Button
            variant={canShare ? "quiet" : "signal"}
            disabled={busy}
            onClick={onDownload}
            className={`w-full ${canShare ? "!border-proof-ink/20 !bg-proof-ink/5 !text-proof-ink" : "!text-proof"}`}
          >
            <IconDownload className="h-4 w-4" />
            {busy ? "Готуємо…" : "Завантажити PNG"}
          </Button>
        </div>
      </div>
    </div>
  );
}
