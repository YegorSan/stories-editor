"use client";

import { IconSafeZone } from "@/components/ui/icons";
import { STORY_H, STORY_W } from "@/lib/types";

export function StatusBar({
  saveState,
  safeZones,
  onToggleSafeZones,
  readout,
  zoomLabel,
}: {
  saveState: "idle" | "saving" | "saved" | "error";
  safeZones: boolean;
  onToggleSafeZones: () => void;
  readout: string | null;
  zoomLabel: string;
}) {
  const saveLabel =
    saveState === "error"
      ? "помилка"
      : saveState === "saved"
        ? "збережено"
        : saveState === "saving"
          ? "зберігаємо…"
          : "—";

  return (
    <footer className="hidden h-7 shrink-0 items-center gap-4 border-t border-rule bg-bench px-3 md:flex">
      <span className="data-mono text-ash">
        {STORY_W}×{STORY_H}
      </span>
      <span className="data-mono text-ash">{zoomLabel}</span>
      {readout ? (
        <span className="data-mono text-bone">{readout}</span>
      ) : (
        <span className="data-mono text-ash">x — · y —</span>
      )}
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSafeZones}
          className={`flex items-center gap-1.5 transition-colors ${
            safeZones ? "text-guide" : "text-ash hover:text-bone"
          }`}
          title="Safe zones"
        >
          <IconSafeZone className="h-3.5 w-3.5" />
          <span className="label-condensed text-[9px]">Safe</span>
        </button>
        <span className="flex items-center gap-1.5">
          <span
            className={`save-dot ${
              saveState === "saving"
                ? "save-dot--saving"
                : saveState === "saved"
                  ? "save-dot--saved"
                  : saveState === "error"
                    ? "save-dot--error"
                    : ""
            }`}
          />
          <span className="micro-mono text-ash">{saveLabel}</span>
        </span>
      </div>
    </footer>
  );
}
