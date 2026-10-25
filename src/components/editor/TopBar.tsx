"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FrameNo } from "@/components/ui/FrameNo";
import { IconBack, IconRedo, IconUndo } from "@/components/ui/icons";

export function TopBar({
  title,
  frameIndex,
  saveState,
  canUndo,
  canRedo,
  onTitle,
  onUndo,
  onRedo,
  onExport,
}: {
  title: string;
  frameIndex: number;
  saveState: "idle" | "saving" | "saved" | "error";
  canUndo: boolean;
  canRedo: boolean;
  onTitle: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-rule bg-bench px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Link
          href="/"
          aria-label="На головну"
          className="flex h-9 w-9 shrink-0 items-center justify-center text-ash hover:text-bone md:hidden"
        >
          <IconBack />
        </Link>
        <Link
          href="/"
          className="hidden shrink-0 font-display text-lg tracking-tight text-bone hover:text-signal md:inline"
        >
          Kadr
        </Link>

        <div className="flex min-w-0 items-center gap-2 border-l border-rule pl-2 md:pl-3">
          <FrameNo index={frameIndex} active className="shrink-0" />
          <input
            value={title}
            onChange={(event) => onTitle(event.target.value)}
            aria-label="Назва кадру"
            className="min-w-0 max-w-[10rem] truncate bg-transparent font-display text-sm text-bone outline-none ring-0 focus:text-bone sm:max-w-xs md:text-base"
          />
          <span
            className={`save-dot hidden sm:inline-block ${
              saveState === "saving"
                ? "save-dot--saving"
                : saveState === "saved"
                  ? "save-dot--saved"
                  : saveState === "error"
                    ? "save-dot--error"
                    : ""
            }`}
            title={
              saveState === "error"
                ? "не вдалося зберегти"
                : saveState === "saved"
                  ? "збережено"
                  : "зберігаємо…"
            }
            aria-label="Стан збереження"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo ⌘Z"
          className="!min-h-9 !px-2"
          aria-label="Undo"
        >
          <IconUndo />
        </Button>
        <Button
          variant="ghost"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo ⌘⇧Z"
          className="!min-h-9 !px-2"
          aria-label="Redo"
        >
          <IconRedo />
        </Button>
        <Button
          variant="shutter"
          onClick={onExport}
          title="Експорт"
          aria-label="Експорт"
          className="ml-1 !text-[9px] tracking-[0.04em]"
        >
          Екс
        </Button>
      </div>
    </header>
  );
}
