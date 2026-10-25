"use client";

import {
  IconBackground,
  IconMedia,
  IconStickers,
  IconTemplates,
  IconText,
} from "@/components/ui/icons";
import type { EditorTab } from "./types";

const TOOLS: { id: EditorTab; label: string; Icon: typeof IconTemplates }[] = [
  { id: "templates", label: "Шаблони", Icon: IconTemplates },
  { id: "stickers", label: "Стікери", Icon: IconStickers },
  { id: "text", label: "Текст", Icon: IconText },
  { id: "bg", label: "Фон", Icon: IconBackground },
  { id: "media", label: "Медіа", Icon: IconMedia },
];

export function ToolRail({
  tab,
  onTab,
  orientation = "vertical",
}: {
  tab: EditorTab;
  onTab: (tab: EditorTab) => void;
  orientation?: "vertical" | "horizontal";
}) {
  const vertical = orientation === "vertical";

  return (
    <nav
      aria-label="Інструменти"
      className={
        vertical
          ? "flex h-full w-16 shrink-0 flex-col border-r border-rule bg-bench"
          : "flex h-14 w-full shrink-0 items-stretch border-t border-rule bg-bench"
      }
    >
      {TOOLS.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-[color,background] duration-[90ms] ease-[var(--ease-snap)] ${
              vertical ? "px-1 py-3" : "px-1 py-1.5"
            } ${active ? "bg-slab text-bone" : "text-ash hover:text-bone"}`}
          >
            {active ? (
              <span
                className={`absolute bg-signal ${
                  vertical
                    ? "inset-y-2 left-0 w-0.5"
                    : "inset-x-3 top-0 h-0.5"
                }`}
                aria-hidden
              />
            ) : null}
            <Icon className="h-5 w-5" />
            <span className="label-condensed text-[9px] tracking-[0.06em]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
