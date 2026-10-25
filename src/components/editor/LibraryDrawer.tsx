"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CropMarksHost } from "@/components/ui/CropMarks";
import { FrameNo } from "@/components/ui/FrameNo";
import { Label } from "@/components/ui/Label";
import { ScrubField } from "@/components/ui/ScrubField";
import { Segmented } from "@/components/ui/Segmented";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconItalic,
} from "@/components/ui/icons";
import { StickerMark } from "@/components/StickerMark";
import { StoryPreview } from "@/components/StoryFrame";
import { FONT_CATEGORIES, STORY_FONTS, type FontCategory } from "@/lib/fonts";
import { STICKER_PACKS } from "@/lib/stickers";
import { TEMPLATES } from "@/lib/templates";
import type { Align, StoryBackground, StoryElement } from "@/lib/types";
import type { EditorTab } from "./types";

type ChangeHandler = (patch: Partial<StoryElement>) => void;

export type LibraryDrawerProps = {
  tab: EditorTab;
  onAddSticker: (id: string) => void;
  onAddText: () => void;
  onApplyTemplate: (id: string) => void;
  onBackground: (bg: StoryBackground) => void;
  onUploadPhoto: (file: File, asCover: boolean) => void;
  selected: StoryElement | null;
  onChangeSelected: ChangeHandler;
  onCommitSelected: () => void;
  hideHeader?: boolean;
  className?: string;
};

const BACKGROUNDS: StoryBackground[] = [
  { type: "solid", color: "#0E0E0C" },
  { type: "solid", color: "#0D8F82" },
  { type: "solid", color: "#F3F6F9" },
  { type: "solid", color: "#D4536A" },
  { type: "gradient", from: "#12221F", to: "#0E0E0C", angle: 160 },
  { type: "gradient", from: "#E7EEF4", to: "#F0B27A", angle: 180 },
  { type: "gradient", from: "#0E0E0C", to: "#3A1018", angle: 200 },
  { type: "gradient", from: "#1B3A4B", to: "#0E0E0C", angle: 140 },
  { type: "gradient", from: "#2A2118", to: "#0E0E0C", angle: 180 },
];

export function LibraryDrawer(props: LibraryDrawerProps) {
  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col border-r border-rule bg-bench ${props.className ?? ""}`}
    >
      {props.hideHeader ? null : (
        <div className="flex h-10 shrink-0 items-center border-b border-rule px-4">
          <Label tone="bone">{tabTitle(props.tab)}</Label>
        </div>
      )}
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pane-rise"
        key={props.tab}
      >
        {props.tab === "templates" ? (
          <TemplatesPane onApply={props.onApplyTemplate} />
        ) : null}
        {props.tab === "stickers" ? (
          <StickersPane onAdd={props.onAddSticker} />
        ) : null}
        {props.tab === "text" ? (
          <TextPane
            onAddText={props.onAddText}
            selected={props.selected}
            onChange={props.onChangeSelected}
            onCommit={props.onCommitSelected}
          />
        ) : null}
        {props.tab === "bg" ? (
          <BackgroundPane onBackground={props.onBackground} />
        ) : null}
        {props.tab === "media" ? (
          <MediaPane onUploadPhoto={props.onUploadPhoto} />
        ) : null}
      </div>
    </aside>
  );
}

export function tabTitle(tab: EditorTab): string {
  switch (tab) {
    case "templates":
      return "Шаблони";
    case "stickers":
      return "Стікери";
    case "text":
      return "Текст";
    case "bg":
      return "Фон";
    case "media":
      return "Медіа";
    case "layers":
      return "Шари";
  }
}

function TemplatesPane({ onApply }: { onApply: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((template, index) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onApply(template.id)}
          className="group text-left"
        >
          <CropMarksHost className="overflow-hidden rounded-[4px]">
            <StoryPreview doc={template.doc} className="rounded-[4px]" />
          </CropMarksHost>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <FrameNo
              index={index + 1}
              pad={2}
              className="group-hover:text-signal"
            />
            <span className="truncate text-xs text-bone">{template.name}</span>
          </div>
          <p className="label-condensed mt-0.5 text-[9px] text-ash">{template.category}</p>
        </button>
      ))}
    </div>
  );
}

function StickersPane({ onAdd }: { onAdd: (id: string) => void }) {
  const [packId, setPackId] = useState(STICKER_PACKS[0].id);
  const pack = STICKER_PACKS.find((item) => item.id === packId) ?? STICKER_PACKS[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STICKER_PACKS.map((item) => {
          const active = packId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPackId(item.id)}
              className={`flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 transition-[border-color,color,background] duration-[90ms] ${
                active
                  ? "border-bone bg-slab text-bone"
                  : "border-rule text-ash hover:border-rule-strong hover:text-bone"
              }`}
            >
              <span
                className="h-1.5 w-1.5 shrink-0"
                style={{ background: item.accent }}
                aria-hidden
              />
              <span className="label-condensed text-[9px]">{item.name}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-ash">{pack.tagline}</p>
      <div className="grid grid-cols-3 border border-rule">
        {pack.stickers.map((sticker, i) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => onAdd(sticker.id)}
            title={sticker.name}
            className={`aspect-square bg-slab p-2 transition-colors hover:bg-table ${
              i % 3 !== 2 ? "border-r border-rule" : ""
            } ${i < pack.stickers.length - (pack.stickers.length % 3 || 3) ? "border-b border-rule" : ""}`}
          >
            <StickerMark id={sticker.id} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TextPane({
  onAddText,
  selected,
  onChange,
  onCommit,
}: {
  onAddText: () => void;
  selected: StoryElement | null;
  onChange: ChangeHandler;
  onCommit: () => void;
}) {
  const text = selected?.type === "text" ? selected : null;

  return (
    <div className="space-y-4">
      <Button variant="signal" className="w-full font-display text-sm" onClick={onAddText}>
        + Додати текст
      </Button>
      {text ? (
        <>
          <textarea
            value={text.text}
            onChange={(event) => onChange({ text: event.target.value })}
            onBlur={onCommit}
            className="min-h-28 w-full rounded-[2px] border border-rule bg-table p-3 text-sm text-bone outline-none focus:border-bone focus:ring-2 focus:ring-signal/40"
          />
          <FontSpecimen
            activeId={text.fontId}
            onPick={(fontId) => {
              onChange({ fontId });
              onCommit();
            }}
          />
          <ScrubField
            label="Розмір"
            value={text.fontSize}
            min={24}
            max={180}
            step={1}
            onChange={(fontSize) => onChange({ fontSize })}
            onCommit={onCommit}
          />
          <Segmented
            value={text.align}
            onChange={(align) => {
              onChange({ align });
              onCommit();
            }}
            options={[
              { id: "left" as Align, label: <IconAlignLeft />, title: "Ліворуч" },
              { id: "center" as Align, label: <IconAlignCenter />, title: "Центр" },
              { id: "right" as Align, label: <IconAlignRight />, title: "Праворуч" },
            ]}
          />
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={toHex(text.color)}
              onChange={(event) => onChange({ color: event.target.value })}
              onBlur={onCommit}
              className="h-9 w-12 cursor-pointer border border-rule bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                onChange({ italic: !text.italic });
                onCommit();
              }}
              className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                text.italic
                  ? "border-signal bg-signal-tint text-signal"
                  : "border-rule text-ash hover:text-bone"
              }`}
              title="Italic"
            >
              <IconItalic />
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-ash">Обери текстовий шар або додай новий.</p>
      )}
    </div>
  );
}

function FontSpecimen({
  activeId,
  onPick,
}: {
  activeId: string;
  onPick: (fontId: string) => void;
}) {
  const [category, setCategory] = useState<FontCategory | "all">("all");
  const fonts =
    category === "all"
      ? STORY_FONTS
      : STORY_FONTS.filter((font) => font.category === category);

  return (
    <div className="space-y-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {([{ id: "all" as const, label: "Усі" }, ...FONT_CATEGORIES] as const).map(
          (item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`label-condensed shrink-0 border px-2 py-1 text-[9px] ${
                category === item.id
                  ? "border-bone bg-bone text-table"
                  : "border-rule text-ash hover:text-bone"
              }`}
            >
              {item.label}
            </button>
          ),
        )}
      </div>
      <div className="max-h-64 space-y-0 overflow-y-auto border border-rule">
        {fonts.map((font) => {
          const active = activeId === font.id;
          return (
            <button
              key={font.id}
              type="button"
              onClick={() => onPick(font.id)}
              className={`relative flex w-full items-center justify-between gap-2 border-b border-rule px-3 py-2 text-left last:border-b-0 ${
                active ? "bg-signal-tint" : "bg-slab hover:bg-table"
              }`}
            >
              {active ? (
                <span className="absolute inset-y-0 left-0 w-0.5 bg-signal" aria-hidden />
              ) : null}
              <div className="min-w-0">
                <span
                  className="block truncate text-[22px] leading-tight text-bone"
                  style={{ fontFamily: `var(${font.cssVar})` }}
                >
                  Кадр Aa
                </span>
                <span className="micro-mono text-ash">{font.label}</span>
              </div>
              {font.latinOnly ? (
                <span className="micro-mono shrink-0 border border-rule px-1.5 py-0.5 text-ash">
                  A–Z
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BackgroundPane({
  onBackground,
}: {
  onBackground: (bg: StoryBackground) => void;
}) {
  return (
    <div className="space-y-4">
      <Label>Пресети</Label>
      <div className="grid grid-cols-3 gap-2">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.type === "solid" ? bg.color : `${bg.from}-${bg.to}-${bg.angle}`}
            type="button"
            onClick={() => onBackground(bg)}
            aria-label="Обрати фон"
            className="aspect-[9/16] overflow-hidden rounded-[4px] border border-rule"
            style={
              bg.type === "solid"
                ? { background: bg.color }
                : { background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` }
            }
          />
        ))}
      </div>
    </div>
  );
}

function MediaPane({
  onUploadPhoto,
}: {
  onUploadPhoto: (file: File, asCover: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"cover" | "slot">("cover");

  return (
    <div className="space-y-4">
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { id: "cover" as const, label: "На весь кадр" },
          { id: "slot" as const, label: "У слот" },
        ]}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUploadPhoto(file, mode === "cover");
          event.target.value = "";
        }}
      />
      <CropMarksHost always className="rounded-[4px]">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-rule-strong bg-slab py-10 text-ash hover:text-bone"
        >
          <span className="data-mono">+ фото</span>
          <span className="micro-mono">PNG · JPG · WEBP</span>
        </button>
      </CropMarksHost>
      <p className="micro-mono text-ash">
        Подвійний клік по рамці «+ фото» на кадрі (на телефоні — виділи її й
        натисни «Фото» внизу) підставляє знімок у цей слот.
      </p>
    </div>
  );
}

function toHex(color: string): string {
  return /^#([0-9a-f]{6})$/i.test(color) ? color : "#f3f6f9";
}
