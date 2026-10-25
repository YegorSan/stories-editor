"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { SheetDetent } from "./types";

const ORDER: SheetDetent[] = ["peek", "half", "full"];
/** px/ms; a flick faster than this jumps one detent in its direction. */
const FLING_VELOCITY = 0.45;
const TAP_SLOP = 4;

type BottomSheetProps = {
  detent: SheetDetent;
  onDetent: (detent: SheetDetent) => void;
  /** Collapsed height in px; the stage reserves the same space. */
  peekHeight: number;
  /** Drag zone under the grab handle. */
  header?: ReactNode;
  /** Rendered between the drag zone and the content; not draggable. */
  toolbar?: ReactNode;
  children: ReactNode;
  label: string;
};

export function BottomSheet({
  detent,
  onDetent,
  peekHeight,
  header,
  toolbar,
  children,
  label,
}: BottomSheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const drag = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    samples: { t: number; y: number }[];
    moved: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => setAvailable(parent.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const heights: Record<SheetDetent, number> = {
    peek: peekHeight,
    half: Math.max(peekHeight, Math.round(available * 0.55)),
    full: Math.max(peekHeight, available - 12),
  };

  const height = dragHeight ?? heights[detent];

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: heights[detent],
      samples: [{ t: event.timeStamp, y: event.clientY }],
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.abs(dy) < TAP_SLOP) return;
    state.moved = true;
    state.samples.push({ t: event.timeStamp, y: event.clientY });
    if (state.samples.length > 6) state.samples.shift();
    setDragHeight(rubberBand(state.startHeight - dy, heights.peek, heights.full));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    drag.current = null;

    if (!state.moved) {
      setDragHeight(null);
      if (event.type === "pointerup") {
        onDetent(detent === "peek" ? "half" : detent === "half" ? "full" : "peek");
      }
      return;
    }

    const current = dragHeight ?? state.startHeight;
    const first = state.samples[0];
    const last = state.samples[state.samples.length - 1];
    const dt = Math.max(last.t - first.t, 1);
    // Positive velocity = finger moving up = sheet growing.
    const velocity = (first.y - last.y) / dt;

    let next: SheetDetent;
    if (Math.abs(velocity) > FLING_VELOCITY) {
      const ahead =
        velocity > 0
          ? ORDER.filter((d) => heights[d] > current + 1)
          : ORDER.filter((d) => heights[d] < current - 1).reverse();
      next = ahead[0] ?? (velocity > 0 ? "full" : "peek");
    } else {
      next = ORDER[nearestIndex(current + velocity * 120, heights)];
    }

    if (next !== detent) navigator.vibrate?.(6);
    setDragHeight(null);
    onDetent(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = ORDER.indexOf(detent);
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onDetent(ORDER[clampIndex(index + 1)]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      onDetent(ORDER[clampIndex(index - 1)]);
    }
  };

  return (
    <div
      ref={rootRef}
      className="sheet-panel absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[10px] border-t border-rule-strong bg-bench shadow-[0_-16px_40px_-16px_#000000B3]"
      data-dragging={dragHeight !== null}
      data-detent={detent}
      style={{ height }}
    >
      <div
        className="sheet-handle shrink-0 select-none"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuenow={ORDER.indexOf(detent)}
        aria-valuetext={detent === "peek" ? "згорнуто" : detent === "half" ? "наполовину" : "на весь екран"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="flex h-5 items-center justify-center">
          <span className="h-1 w-10 rounded-full bg-rule-strong" />
        </div>
        {header}
      </div>
      {toolbar}
      <div className="min-h-0 flex-1 overflow-hidden overscroll-contain">{children}</div>
    </div>
  );
}

function rubberBand(value: number, min: number, max: number): number {
  if (value < min) return min - Math.sqrt(min - value) * 2;
  if (value > max) return max + Math.sqrt(value - max) * 2;
  return value;
}

function nearestIndex(height: number, heights: Record<SheetDetent, number>): number {
  let best = 0;
  let bestDist = Infinity;
  ORDER.forEach((d, i) => {
    const dist = Math.abs(heights[d] - height);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  });
  return best;
}

function clampIndex(index: number): number {
  return Math.min(ORDER.length - 1, Math.max(0, index));
}
