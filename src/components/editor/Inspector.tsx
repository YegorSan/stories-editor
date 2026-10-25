"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ScrubField } from "@/components/ui/ScrubField";
import {
  IconDelete,
  IconDown,
  IconDuplicate,
  IconEye,
  IconEyeOff,
  IconLayers,
  IconLock,
  IconPhoto,
  IconStickers,
  IconText,
  IconUnlock,
  IconUp,
} from "@/components/ui/icons";
import { STICKER_PACKS } from "@/lib/stickers";
import type { StoryDoc, StoryElement } from "@/lib/types";

type ChangeHandler = (patch: Partial<StoryElement>) => void;

export type InspectorProps = {
  doc: StoryDoc;
  selected: StoryElement | null;
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  onChangeSelected: ChangeHandler;
  onCommitSelected: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLayer: (direction: "up" | "down") => void;
  onToggleLayer: (id: string, flag: LayerFlag) => void;
  hideHeader?: boolean;
  className?: string;
};

export type LayerFlag = "hidden" | "locked";

export function Inspector({
  doc,
  selected,
  selectedId,
  hoveredId,
  onHover,
  onSelect,
  onChangeSelected,
  onCommitSelected,
  onDuplicate,
  onDelete,
  onLayer,
  onToggleLayer,
  hideHeader = false,
  className = "",
}: InspectorProps) {
  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col border-l border-rule bg-bench ${className}`}
    >
      {hideHeader ? null : (
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-rule px-4">
          <IconLayers className="h-4 w-4 text-ash" />
          <Label tone="bone">Шари</Label>
          <span className="data-mono ml-auto text-ash">{doc.elements.length}</span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <LayersStack
          elements={doc.elements}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onHover={onHover}
          onSelect={onSelect}
          onToggle={onToggleLayer}
        />

        {selected ? (
          <div className="space-y-4 border-t border-rule p-4">
            <Label>
              {selected.type === "sticker"
                ? "Стікер"
                : selected.type === "photo"
                  ? "Фото"
                  : "Текст"}
            </Label>

            <TransformControls
              selected={selected}
              onChange={onChangeSelected}
              onCommit={onCommitSelected}
            />

            <ArrangeControls
              onLayer={onLayer}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        ) : (
          <div className="border-t border-rule p-4">
            <p className="text-sm text-ash">
              Обери шар на кадрі або в списку, щоб змінити масштаб, поворот і
              порядок.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function LayersStack({
  elements,
  selectedId,
  hoveredId,
  onHover,
  onSelect,
  onToggle,
}: {
  elements: StoryElement[];
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  onToggle: (id: string, flag: LayerFlag) => void;
}) {
  const ordered = [...elements].sort((a, b) => b.z - a.z);

  if (ordered.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-ash">Порожній кадр — додай шар.</p>
    );
  }

  return (
    <ul className="border-b border-rule">
      {ordered.map((el) => {
        const active = el.id === selectedId;
        const hovered = el.id === hoveredId;
        return (
          <li
            key={el.id}
            className={`relative flex items-stretch border-b border-rule transition-colors last:border-b-0 ${
              active
                ? "bg-signal-tint text-bone"
                : hovered
                  ? "bg-slab text-bone"
                  : "text-ash hover:bg-slab hover:text-bone"
            }`}
            onPointerEnter={() => onHover(el.id)}
            onPointerLeave={() => onHover(null)}
          >
            {active ? (
              <span className="absolute inset-y-0 left-0 w-0.5 bg-signal" aria-hidden />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(el.id)}
              className={`flex min-w-0 flex-1 items-center gap-2 py-2.5 pl-3 text-left [@media(pointer:coarse)]:min-h-12 ${
                el.hidden ? "opacity-45" : ""
              }`}
            >
              <LayerIcon type={el.type} />
              <span className="min-w-0 flex-1 truncate text-sm">{layerLabel(el)}</span>
            </button>
            <LayerToggle
              on={!!el.locked}
              label={el.locked ? "Розблокувати" : "Заблокувати"}
              onClick={() => onToggle(el.id, "locked")}
            >
              {el.locked ? <IconLock className="h-4 w-4" /> : <IconUnlock className="h-4 w-4" />}
            </LayerToggle>
            <LayerToggle
              on={!!el.hidden}
              label={el.hidden ? "Показати" : "Сховати"}
              onClick={() => onToggle(el.id, "hidden")}
            >
              {el.hidden ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </LayerToggle>
          </li>
        );
      })}
    </ul>
  );
}

function LayerToggle({
  on,
  label,
  onClick,
  children,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      title={label}
      onClick={onClick}
      className={`flex w-9 shrink-0 items-center justify-center transition-colors [@media(pointer:coarse)]:w-11 ${
        on ? "text-signal" : "text-ash/50 hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}

function LayerIcon({ type }: { type: StoryElement["type"] }) {
  const cls = "h-4 w-4 shrink-0";
  if (type === "text") return <IconText className={cls} />;
  if (type === "photo") return <IconPhoto className={cls} />;
  return <IconStickers className={cls} />;
}

function layerLabel(el: StoryElement): string {
  if (el.type === "text") {
    const t = el.text.trim();
    return t ? (t.length > 28 ? `${t.slice(0, 28)}…` : t) : "Текст";
  }
  if (el.type === "photo") return el.src ? "Фото" : "Слот фото";
  const name = STICKER_PACKS.flatMap((p) => p.stickers).find(
    (s) => s.id === el.stickerId,
  )?.name;
  return name ?? "Стікер";
}

function TransformControls({
  selected,
  onChange,
  onCommit,
}: {
  selected: StoryElement;
  onChange: ChangeHandler;
  onCommit: () => void;
}) {
  return (
    <div className="space-y-3">
      <ScrubField
        label="Масштаб"
        value={selected.scale}
        min={0.2}
        max={4}
        step={0.01}
        decimals={2}
        suffix="×"
        onChange={(scale) => onChange({ scale })}
        onCommit={onCommit}
      />
      <ScrubField
        label="Поворот"
        value={selected.rotation}
        min={-180}
        max={180}
        step={1}
        suffix="°"
        onChange={(rotation) => onChange({ rotation })}
        onCommit={onCommit}
      />
      <div className="grid grid-cols-2 gap-2">
        <ScrubField
          label="X"
          value={Math.round(selected.x)}
          min={0}
          max={1080}
          step={1}
          onChange={(x) => onChange({ x })}
          onCommit={onCommit}
        />
        <ScrubField
          label="Y"
          value={Math.round(selected.y)}
          min={0}
          max={1920}
          step={1}
          onChange={(y) => onChange({ y })}
          onCommit={onCommit}
        />
      </div>
    </div>
  );
}

function ArrangeControls({
  onLayer,
  onDuplicate,
  onDelete,
}: {
  onLayer: (direction: "up" | "down") => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!confirm) return;
    const t = window.setTimeout(() => setConfirm(false), 2000);
    return () => window.clearTimeout(t);
  }, [confirm]);

  return (
    <div className="space-y-2">
      <Label>Порядок</Label>
      <div className="flex flex-wrap gap-2">
        <Button variant="quiet" onClick={() => onLayer("up")} title="Вище">
          <IconUp className="h-4 w-4" />
          Вище
        </Button>
        <Button variant="quiet" onClick={() => onLayer("down")} title="Нижче">
          <IconDown className="h-4 w-4" />
          Нижче
        </Button>
        <Button variant="quiet" onClick={onDuplicate}>
          <IconDuplicate className="h-4 w-4" />
          Дубль
        </Button>
        <Button
          variant={confirm ? "danger" : "quiet"}
          onClick={() => {
            if (confirm) {
              onDelete();
              setConfirm(false);
            } else {
              setConfirm(true);
            }
          }}
        >
          <IconDelete className="h-4 w-4" />
          {confirm ? "Точно?" : "Видалити"}
        </Button>
      </div>
    </div>
  );
}
