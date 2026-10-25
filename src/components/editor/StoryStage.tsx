"use client";

import { useMemo, useRef, useState } from "react";
import { ScaledStory } from "@/components/ScaledStory";
import { ElementVisual, StoryFrame, elementPlacementStyle } from "@/components/StoryFrame";
import { STORY_H, STORY_W, type StoryDoc, type StoryElement } from "@/lib/types";
import { SAFE_ZONE_BOTTOM, SAFE_ZONE_TOP } from "./types";

type DragMode = "move" | "scale" | "rotate";

type StoryStageProps = {
  doc: StoryDoc;
  selectedId: string | null;
  hoveredId?: string | null;
  safeZones?: boolean;
  flash?: boolean;
  onSelect: (id: string | null) => void;
  onChangeElement: (id: string, patch: Partial<StoryElement>) => void;
  onCommit: () => void;
  onPhotoPick: (id: string) => void;
  onReadout?: (text: string | null) => void;
};

export function StoryStage({
  doc,
  selectedId,
  hoveredId = null,
  safeZones = false,
  flash = false,
  onSelect,
  onChangeElement,
  onCommit,
  onPhotoPick,
  onReadout,
}: StoryStageProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    mode: DragMode;
    id: string;
    startX: number;
    startY: number;
    orig: StoryElement;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const toStoryPoint = (clientX: number, clientY: number) => {
    const frame = shellRef.current?.querySelector("[data-story-frame]");
    if (!frame) return { x: 0, y: 0 };
    const rect = frame.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * STORY_W,
      y: ((clientY - rect.top) / rect.height) * STORY_H,
    };
  };

  const publishReadout = (el: StoryElement) => {
    onReadout?.(
      `x ${Math.round(el.x)} · y ${Math.round(el.y)} · ${el.scale.toFixed(2)}× · ${Math.round(el.rotation)}°`,
    );
  };

  const onPointerMove = (event: PointerEvent) => {
    const state = drag.current;
    if (!state) return;
    const point = toStoryPoint(event.clientX, event.clientY);
    const orig = state.orig;

    if (state.mode === "move") {
      const patch = {
        x: orig.x + (point.x - state.startX),
        y: orig.y + (point.y - state.startY),
      };
      onChangeElement(state.id, patch);
      publishReadout({ ...orig, ...patch });
      return;
    }

    if (state.mode === "scale") {
      const origDist = Math.hypot(state.startX - orig.x, state.startY - orig.y);
      const nextDist = Math.hypot(point.x - orig.x, point.y - orig.y);
      const nextScale = Math.min(
        4,
        Math.max(0.2, orig.scale * (nextDist / Math.max(origDist, 1))),
      );
      onChangeElement(state.id, { scale: nextScale });
      publishReadout({ ...orig, scale: nextScale });
      return;
    }

    const startAngle = Math.atan2(state.startY - orig.y, state.startX - orig.x);
    const nextAngle = Math.atan2(point.y - orig.y, point.x - orig.x);
    const delta = ((nextAngle - startAngle) * 180) / Math.PI;
    const rotation = orig.rotation + delta;
    onChangeElement(state.id, { rotation });
    publishReadout({ ...orig, rotation });
  };

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    onReadout?.(null);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    onCommit();
  };

  const startDrag = (
    event: React.PointerEvent,
    id: string,
    mode: DragMode,
  ) => {
    event.stopPropagation();
    const el = doc.elements.find((item) => item.id === id);
    if (!el) return;
    const point = toStoryPoint(event.clientX, event.clientY);
    drag.current = {
      mode,
      id,
      startX: point.x,
      startY: point.y,
      orig: { ...el },
    };
    setDragging(true);
    publishReadout(el);
    onSelect(id);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  };

  const selected = useMemo(
    () => doc.elements.find((item) => item.id === selectedId) ?? null,
    [doc.elements, selectedId],
  );

  return (
    <div
      ref={shellRef}
      className="stage-grid relative h-full min-h-0 p-3"
      onPointerDown={() => onSelect(null)}
    >
      <ScaledStory
        fit="contain"
        className="h-full"
        showCropMarks
        overlay={
          <>
            {safeZones ? <SafeZoneOverlay /> : null}
            {selected ? (
              <Handles
                el={selected}
                dragging={dragging}
                onScale={(event) => startDrag(event, selected.id, "scale")}
                onRotate={(event) => startDrag(event, selected.id, "rotate")}
              />
            ) : null}
            {flash ? <div className="shutter-flash" aria-hidden /> : null}
          </>
        }
      >
        <StoryFrame doc={{ ...doc, elements: [] }}>
          {[...doc.elements]
            .sort((a, b) => a.z - b.z)
            .map((el) => {
              const active = el.id === selectedId;
              const hovered = el.id === hoveredId && !active;
              return (
                <div
                  key={el.id}
                  role="button"
                  tabIndex={0}
                  className={`cursor-grab touch-none ${active ? "z-50" : ""}`}
                  style={elementPlacementStyle(el, { zIndex: active ? 50 : el.z })}
                  onPointerDown={(event) => startDrag(event, el.id, "move")}
                  onDoubleClick={() => {
                    if (el.type === "photo") onPhotoPick(el.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSelect(el.id);
                  }}
                >
                  <div
                    className={
                      active
                        ? "selection-hairline"
                        : hovered
                          ? "selection-guide"
                          : ""
                    }
                  >
                    <ElementVisual el={el} />
                  </div>
                </div>
              );
            })}
        </StoryFrame>
      </ScaledStory>
    </div>
  );
}

function SafeZoneOverlay() {
  const topPct = (SAFE_ZONE_TOP / STORY_H) * 100;
  const bottomPct = (SAFE_ZONE_BOTTOM / STORY_H) * 100;
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden>
      <div
        className="absolute inset-x-0 top-0 bg-guide/15"
        style={{ height: `${topPct}%` }}
      />
      <div
        className="absolute inset-x-0 top-0 border-b border-dashed border-guide"
        style={{ height: `${topPct}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-guide/15"
        style={{ height: `${bottomPct}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 border-t border-dashed border-guide"
        style={{ height: `${bottomPct}%` }}
      />
    </div>
  );
}

function Handles({
  el,
  dragging,
  onScale,
  onRotate,
}: {
  el: StoryElement;
  dragging: boolean;
  onScale: (event: React.PointerEvent) => void;
  onRotate: (event: React.PointerEvent) => void;
}) {
  const left = clampPercent((el.x / STORY_W) * 100);
  const top = clampPercent((el.y / STORY_H) * 100);

  return (
    <>
      {dragging ? (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 rounded-[2px] border border-rule-strong bg-bench/95 px-2 py-1 data-mono text-bone shadow-[0_8px_24px_-8px_#000000A6]"
          style={{ left: `${left}%`, top: `calc(${top}% + 28px)` }}
        >
          x {Math.round(el.x)} · y {Math.round(el.y)} · {el.scale.toFixed(2)}× ·{" "}
          {Math.round(el.rotation)}°
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Повернути"
        className="absolute z-50 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-signal bg-bench text-signal shadow-md [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9"
        style={{ left: `${left}%`, top: `calc(${top}% - 32px)` }}
        onPointerDown={onRotate}
      >
        <span className="block h-3 w-3 rounded-full border-[1.5px] border-signal" />
      </button>
      <button
        type="button"
        aria-label="Масштаб"
        className="absolute z-50 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[1px] border border-bone bg-signal shadow-md sm:h-2.5 sm:w-2.5 [@media(pointer:coarse)]:h-3.5 [@media(pointer:coarse)]:w-3.5"
        style={{ left: `calc(${left}% + 18px)`, top: `calc(${top}% + 18px)` }}
        onPointerDown={onScale}
      />
    </>
  );
}

function clampPercent(value: number): number {
  return Math.min(97, Math.max(3, value));
}
