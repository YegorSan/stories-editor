"use client";

import { useRef, useState } from "react";

type ScrubFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  decimals?: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function format(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

export function ScrubField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  decimals = 0,
  onChange,
  onCommit,
}: ScrubFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const scrub = useRef<{ startX: number; startValue: number } | null>(null);
  const ticks = 12;
  const display = draft ?? format(value, decimals);

  const apply = (next: number, commit = false) => {
    const snapped = clamp(Math.round(next / step) * step, min, max);
    const rounded =
      decimals > 0 ? Number(snapped.toFixed(decimals)) : Math.round(snapped);
    onChange(rounded);
    if (draft !== null) setDraft(format(rounded, decimals));
    if (commit) onCommit?.();
  };

  const onPointerDownLabel = (event: React.PointerEvent) => {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    scrub.current = { startX: event.clientX, startValue: value };
  };

  const onPointerMoveLabel = (event: React.PointerEvent) => {
    if (!scrub.current) return;
    const delta = event.clientX - scrub.current.startX;
    const speed = event.shiftKey ? step * 10 : step;
    const next = scrub.current.startValue + (delta / 4) * speed;
    apply(next);
  };

  const endScrub = () => {
    if (!scrub.current) return;
    scrub.current = null;
    onCommit?.();
  };

  const pct = clamp(((value - min) / (max - min)) * 100, 0, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="label-condensed cursor-ew-resize touch-none select-none text-ash hover:text-bone"
          onPointerDown={onPointerDownLabel}
          onPointerMove={onPointerMoveLabel}
          onPointerUp={endScrub}
          onPointerCancel={endScrub}
        >
          {label}
        </button>
        <div className="flex items-center gap-1">
          <input
            value={display}
            aria-label={label}
            onFocus={() => setDraft(format(value, decimals))}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              const parsed = Number((draft ?? display).replace(",", "."));
              setDraft(null);
              if (Number.isFinite(parsed)) apply(parsed, true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                (event.target as HTMLInputElement).blur();
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                apply(value + (event.shiftKey ? step * 10 : step), true);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                apply(value - (event.shiftKey ? step * 10 : step), true);
              }
            }}
            inputMode="decimal"
            className="data-mono w-14 rounded-[2px] [@media(pointer:coarse)]:w-[4.5rem] border border-rule bg-table px-1.5 py-1 text-right text-bone outline-none focus:border-bone focus:ring-2 focus:ring-signal/40"
          />
          {suffix ? <span className="micro-mono text-ash">{suffix}</span> : null}
        </div>
      </div>
      <div className="relative h-5 [@media(pointer:coarse)]:h-8">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
        <div
          className="absolute inset-y-0 left-0 flex w-full items-center justify-between px-0"
          aria-hidden
        >
          {Array.from({ length: ticks + 1 }, (_, i) => (
            <span
              key={i}
              className={`w-px ${i % 3 === 0 ? "h-2.5 bg-rule-strong" : "h-1.5 bg-rule"}`}
            />
          ))}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(event) => apply(Number(event.target.value))}
          onPointerUp={() => onCommit?.()}
          onKeyUp={() => onCommit?.()}
          className="absolute inset-0 w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
        />
        <span
          className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-signal [@media(pointer:coarse)]:h-4 [@media(pointer:coarse)]:w-4"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
