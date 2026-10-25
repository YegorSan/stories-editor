"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrubField } from "@/components/ui/ScrubField";
import {
  IconCheck,
  IconDelete,
  IconDown,
  IconDuplicate,
  IconEdit,
  IconLayers,
  IconMinus,
  IconPhoto,
  IconPlus,
  IconUp,
} from "@/components/ui/icons";
import { STORY_H, STORY_W, type StoryElement } from "@/lib/types";

type AdjustMode = "scale" | "rotate" | "position";

const MODES: { id: AdjustMode; label: string }[] = [
  { id: "scale", label: "Масштаб" },
  { id: "rotate", label: "Поворот" },
  { id: "position", label: "Позиція" },
];

export function MobileAdjust({
  selected,
  onChange,
  onCommit,
}: {
  selected: StoryElement;
  onChange: (patch: Partial<StoryElement>) => void;
  onCommit: () => void;
}) {
  const [mode, setMode] = useState<AdjustMode>("scale");

  const reset = () => {
    if (mode === "scale") onChange({ scale: 1 });
    else if (mode === "rotate") onChange({ rotation: 0 });
    else onChange({ x: STORY_W / 2, y: STORY_H / 2 });
    onCommit();
  };

  return (
    <div className="shrink-0 space-y-2 px-3 pb-2">
      <div className="flex items-center gap-1">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
            className={`label-condensed h-8 rounded-full border px-3 text-[10px] transition-colors ${
              mode === item.id
                ? "border-bone bg-bone text-table"
                : "border-rule text-ash"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className="data-mono ml-auto h-8 rounded-full border border-rule px-3 text-ash"
        >
          {mode === "scale" ? "1×" : mode === "rotate" ? "0°" : "центр"}
        </button>
      </div>

      {mode === "position" ? (
        <div className="grid grid-cols-2 gap-3">
          <ScrubField
            label="X"
            value={Math.round(selected.x)}
            min={0}
            max={STORY_W}
            step={1}
            onChange={(x) => onChange({ x })}
            onCommit={onCommit}
          />
          <ScrubField
            label="Y"
            value={Math.round(selected.y)}
            min={0}
            max={STORY_H}
            step={1}
            onChange={(y) => onChange({ y })}
            onCommit={onCommit}
          />
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <RepeatButton
            label="Менше"
            onStep={() =>
              mode === "scale"
                ? onChange({ scale: Math.max(0.2, round2(selected.scale - 0.01)) })
                : onChange({ rotation: Math.max(-180, Math.round(selected.rotation) - 1) })
            }
            onRelease={onCommit}
          >
            <IconMinus />
          </RepeatButton>
          <div className="min-w-0 flex-1">
            {mode === "scale" ? (
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
            ) : (
              <ScrubField
                label="Поворот"
                value={Math.round(selected.rotation)}
                min={-180}
                max={180}
                step={1}
                suffix="°"
                onChange={(rotation) => onChange({ rotation })}
                onCommit={onCommit}
              />
            )}
          </div>
          <RepeatButton
            label="Більше"
            onStep={() =>
              mode === "scale"
                ? onChange({ scale: Math.min(4, round2(selected.scale + 0.01)) })
                : onChange({ rotation: Math.min(180, Math.round(selected.rotation) + 1) })
            }
            onRelease={onCommit}
          >
            <IconPlus />
          </RepeatButton>
        </div>
      )}
    </div>
  );
}

/** Steps once on press, then repeats while held; commits once on release. */
function RepeatButton({
  label,
  onStep,
  onRelease,
  children,
}: {
  label: string;
  onStep: () => void;
  onRelease: () => void;
  children: ReactNode;
}) {
  const step = useRef(onStep);
  const timersRef = useRef<{ delay?: number; repeat?: number }>({});
  const held = useRef(false);

  useEffect(() => {
    step.current = onStep;
  });

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      window.clearTimeout(timers.delay);
      window.clearInterval(timers.repeat);
    };
  }, []);

  const stop = () => {
    const timers = timersRef.current;
    window.clearTimeout(timers.delay);
    window.clearInterval(timers.repeat);
    if (held.current) {
      held.current = false;
      onRelease();
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule bg-slab text-bone"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        held.current = true;
        step.current();
        const timers = timersRef.current;
        timers.delay = window.setTimeout(() => {
          timers.repeat = window.setInterval(() => step.current(), 50);
        }, 350);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          step.current();
          onRelease();
        }
      }}
    >
      {children}
    </button>
  );
}

export function MobileActionBar({
  selected,
  onDone,
  onEdit,
  onLayer,
  onDuplicate,
  onDelete,
  onLayers,
}: {
  selected: StoryElement;
  onDone: () => void;
  onEdit: () => void;
  onLayer: (direction: "up" | "down") => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLayers: () => void;
}) {
  const edit =
    selected.type === "text"
      ? { label: "Текст", Icon: IconEdit }
      : selected.type === "photo"
        ? { label: "Фото", Icon: IconPhoto }
        : null;

  return (
    <nav
      aria-label="Дії з шаром"
      className="flex w-full shrink-0 items-stretch border-t border-rule bg-bench pb-[env(safe-area-inset-bottom)]"
    >
      <ActionButton label="Готово" onClick={onDone} tone="signal">
        <IconCheck className="h-5 w-5" />
      </ActionButton>
      {edit ? (
        <ActionButton label={edit.label} onClick={onEdit}>
          <edit.Icon className="h-5 w-5" />
        </ActionButton>
      ) : null}
      <ActionButton label="Вище" onClick={() => onLayer("up")}>
        <IconUp className="h-5 w-5" />
      </ActionButton>
      <ActionButton label="Нижче" onClick={() => onLayer("down")}>
        <IconDown className="h-5 w-5" />
      </ActionButton>
      <ActionButton label="Дубль" onClick={onDuplicate}>
        <IconDuplicate className="h-5 w-5" />
      </ActionButton>
      <ActionButton label="Шари" onClick={onLayers}>
        <IconLayers className="h-5 w-5" />
      </ActionButton>
      <ActionButton label="Видалити" onClick={onDelete} tone="danger">
        <IconDelete className="h-5 w-5" />
      </ActionButton>
    </nav>
  );
}

function ActionButton({
  label,
  onClick,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "signal" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 ${
        tone === "signal" ? "text-signal" : tone === "danger" ? "text-danger" : "text-ash"
      }`}
    >
      {children}
      <span className="label-condensed truncate text-[9px] tracking-[0.04em]">{label}</span>
    </button>
  );
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
