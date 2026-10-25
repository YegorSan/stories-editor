"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScaledStory } from "@/components/ScaledStory";
import { ElementVisual, StoryFrame, elementPlacementStyle } from "@/components/StoryFrame";
import { STORY_H, STORY_W, type StoryDoc, type StoryElement } from "@/lib/types";
import { SAFE_ZONE_BOTTOM, SAFE_ZONE_TOP } from "./types";

type Point = { x: number; y: number };

type Gesture =
  | {
      kind: "move";
      id: string;
      pointerId: number;
      start: Point;
      orig: StoryElement;
      moved: boolean;
    }
  | {
      kind: "scale" | "rotate";
      id: string;
      pointerId: number;
      start: Point;
      orig: StoryElement;
    }
  | {
      kind: "pinch";
      id: string;
      a: number;
      b: number;
      startDist: number;
      startAngle: number;
      startMid: Point;
      orig: StoryElement;
    }
  | { kind: "tap"; pointerId: number; start: Point; moved: boolean };

type Guides = { x: boolean; y: boolean; angle: boolean };

const NO_GUIDES: Guides = { x: false, y: false, angle: false };
/** Screen pixels a finger may drift before a press stops counting as a tap. */
const TAP_SLOP = 6;
/** Screen pixels within which position snaps to the frame centre lines. */
const SNAP_PX = 8;
const SNAP_DEG = 4;
const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

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
  /** Fires on any press on the stage, before selection changes. */
  onInteract?: () => void;
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
  onInteract,
}: StoryStageProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const live = useRef<StoryElement | null>(null);
  const guidesRef = useRef<Guides>(NO_GUIDES);
  const [dragging, setDragging] = useState(false);
  const [touchGesture, setTouchGesture] = useState(false);
  const [guides, setGuides] = useState<Guides>(NO_GUIDES);

  const frameRect = () =>
    shellRef.current?.querySelector("[data-story-frame]")?.getBoundingClientRect() ?? null;

  const toStory = (p: Point): Point => {
    const rect = frameRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((p.x - rect.left) / rect.width) * STORY_W,
      y: ((p.y - rect.top) / rect.height) * STORY_H,
    };
  };

  /** Story units per screen pixel, for converting screen-space thresholds. */
  const unitsPerPx = () => {
    const rect = frameRect();
    return rect && rect.width > 0 ? STORY_W / rect.width : 1;
  };

  const publishReadout = (el: StoryElement) => {
    onReadout?.(
      `x ${Math.round(el.x)} · y ${Math.round(el.y)} · ${el.scale.toFixed(2)}× · ${Math.round(el.rotation)}°`,
    );
  };

  const updateGuides = (next: Guides) => {
    const prev = guidesRef.current;
    if (prev.x === next.x && prev.y === next.y && prev.angle === next.angle) return;
    const engaged =
      (next.x && !prev.x) || (next.y && !prev.y) || (next.angle && !prev.angle);
    if (engaged) navigator.vibrate?.(8);
    guidesRef.current = next;
    setGuides(next);
  };

  const apply = (id: string, base: StoryElement, patch: Partial<StoryElement>) => {
    const next = { ...base, ...patch } as StoryElement;
    live.current = next;
    onChangeElement(id, patch);
    publishReadout(next);
  };

  const snapPosition = (x: number, y: number, free: boolean) => {
    if (free) return { x, y, gx: false, gy: false };
    const slop = SNAP_PX * unitsPerPx();
    const gx = Math.abs(x - STORY_W / 2) < slop;
    const gy = Math.abs(y - STORY_H / 2) < slop;
    return { x: gx ? STORY_W / 2 : x, y: gy ? STORY_H / 2 : y, gx, gy };
  };

  const snapAngle = (deg: number, free: boolean) => {
    const normalized = normalizeAngle(deg);
    if (free) return { rotation: normalized, snapped: false };
    const nearest = Math.round(normalized / 45) * 45;
    const snapped = Math.abs(normalized - nearest) < SNAP_DEG;
    return { rotation: snapped ? normalizeAngle(nearest) : normalized, snapped };
  };

  const beginPinch = (id: string, a: number, b: number) => {
    const pa = pointers.current.get(a);
    const pb = pointers.current.get(b);
    const el = live.current?.id === id ? live.current : findEl(doc, id);
    if (!pa || !pb || !el) return;
    gesture.current = {
      kind: "pinch",
      id,
      a,
      b,
      startDist: Math.max(Math.hypot(pb.x - pa.x, pb.y - pa.y), 1),
      startAngle: Math.atan2(pb.y - pa.y, pb.x - pa.x),
      startMid: toStory(midpoint(pa, pb)),
      orig: { ...el },
    };
    live.current = { ...el };
    if (selectedId !== id) onSelect(id);
    setDragging(true);
    setTouchGesture(true);
    publishReadout(el);
  };

  const beginSingle = (
    kind: "move" | "scale" | "rotate",
    id: string,
    pointerId: number,
  ) => {
    const el = findEl(doc, id);
    const p = pointers.current.get(pointerId);
    if (!el || !p) return;
    const start = toStory(p);
    gesture.current =
      kind === "move"
        ? { kind, id, pointerId, start, orig: { ...el }, moved: false }
        : { kind, id, pointerId, start, orig: { ...el } };
    live.current = { ...el };
    setDragging(true);
    publishReadout(el);
  };

  const finish = () => {
    gesture.current = null;
    live.current = null;
    setDragging(false);
    setTouchGesture(false);
    updateGuides(NO_GUIDES);
    onReadout?.(null);
    onCommit();
  };

  const track = (event: React.PointerEvent) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    onInteract?.();
  };

  /** A second finger anywhere on the stage turns the current gesture into a pinch. */
  const tryUpgradeToPinch = (pointerId: number): boolean => {
    const g = gesture.current;
    if (!g || pointers.current.size !== 2) return false;
    if (g.kind === "move") {
      beginPinch(g.id, g.pointerId, pointerId);
      return true;
    }
    if (g.kind === "tap" && selectedId) {
      const el = findEl(doc, selectedId);
      if (el && !el.locked && !el.hidden) {
        beginPinch(selectedId, g.pointerId, pointerId);
        return true;
      }
    }
    return false;
  };

  const onElementDown = (event: React.PointerEvent, el: StoryElement) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    track(event);
    if (tryUpgradeToPinch(event.pointerId)) return;
    if (gesture.current) return;
    if (selectedId !== el.id) onSelect(el.id);
    setTouchGesture(event.pointerType === "touch");
    beginSingle("move", el.id, event.pointerId);
  };

  const onHandleDown = (event: React.PointerEvent, kind: "scale" | "rotate") => {
    event.stopPropagation();
    if (gesture.current || !selectedId) return;
    track(event);
    beginSingle(kind, selectedId, event.pointerId);
  };

  const onShellDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    track(event);
    if (tryUpgradeToPinch(event.pointerId)) return;
    if (gesture.current) return;
    gesture.current = {
      kind: "tap",
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      moved: false,
    };
  };

  const handlers = useRef<{
    move: (event: PointerEvent) => void;
    up: (event: PointerEvent) => void;
  }>({ move: () => {}, up: () => {} });

  useLayoutEffect(() => {
    handlers.current.move = (event: PointerEvent) => {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const g = gesture.current;
      if (!g) return;
      const free = event.altKey;

      if (g.kind === "tap") {
        if (g.pointerId !== event.pointerId) return;
        if (Math.hypot(event.clientX - g.start.x, event.clientY - g.start.y) > TAP_SLOP) {
          g.moved = true;
        }
        return;
      }

      if (g.kind === "pinch") {
        const pa = pointers.current.get(g.a);
        const pb = pointers.current.get(g.b);
        if (!pa || !pb) return;
        const dist = Math.max(Math.hypot(pb.x - pa.x, pb.y - pa.y), 1);
        const angle = Math.atan2(pb.y - pa.y, pb.x - pa.x);
        const mid = toStory(midpoint(pa, pb));
        let scale = clamp(g.orig.scale * (dist / g.startDist), MIN_SCALE, MAX_SCALE);
        if (!free && Math.abs(scale - 1) < 0.03) scale = 1;
        const rot = snapAngle(
          g.orig.rotation + ((angle - g.startAngle) * 180) / Math.PI,
          free,
        );
        const pos = snapPosition(
          g.orig.x + (mid.x - g.startMid.x),
          g.orig.y + (mid.y - g.startMid.y),
          free,
        );
        updateGuides({ x: pos.gx, y: pos.gy, angle: rot.snapped });
        apply(g.id, g.orig, { x: pos.x, y: pos.y, scale, rotation: rot.rotation });
        return;
      }

      if (g.pointerId !== event.pointerId) return;
      const point = toStory({ x: event.clientX, y: event.clientY });
      const orig = g.orig;

      if (g.kind === "move") {
        if (!g.moved) {
          const px = Math.hypot(point.x - g.start.x, point.y - g.start.y) / unitsPerPx();
          if (px < TAP_SLOP / 2) return;
          g.moved = true;
        }
        const pos = snapPosition(
          orig.x + (point.x - g.start.x),
          orig.y + (point.y - g.start.y),
          free,
        );
        updateGuides({ x: pos.gx, y: pos.gy, angle: false });
        apply(g.id, orig, { x: pos.x, y: pos.y });
        return;
      }

      if (g.kind === "scale") {
        const origDist = Math.hypot(g.start.x - orig.x, g.start.y - orig.y);
        const nextDist = Math.hypot(point.x - orig.x, point.y - orig.y);
        let scale = clamp(
          orig.scale * (nextDist / Math.max(origDist, 1)),
          MIN_SCALE,
          MAX_SCALE,
        );
        if (!free && Math.abs(scale - 1) < 0.03) scale = 1;
        apply(g.id, orig, { scale });
        return;
      }

      const startAngle = Math.atan2(g.start.y - orig.y, g.start.x - orig.x);
      const nextAngle = Math.atan2(point.y - orig.y, point.x - orig.x);
      const rot = snapAngle(
        orig.rotation + ((nextAngle - startAngle) * 180) / Math.PI,
        free,
      );
      updateGuides({ x: false, y: false, angle: rot.snapped });
      apply(g.id, orig, { rotation: rot.rotation });
    };

    handlers.current.up = (event: PointerEvent) => {
      if (!pointers.current.delete(event.pointerId)) return;
      const g = gesture.current;
      if (!g) return;

      if (g.kind === "tap") {
        if (g.pointerId !== event.pointerId) return;
        gesture.current = null;
        if (!g.moved && event.type === "pointerup") onSelect(null);
        return;
      }

      if (g.kind === "pinch") {
        if (event.pointerId !== g.a && event.pointerId !== g.b) return;
        const rest = event.pointerId === g.a ? g.b : g.a;
        const restPoint = pointers.current.get(rest);
        const current = live.current;
        if (restPoint && current) {
          // Keep dragging with the remaining finger instead of dropping the element.
          gesture.current = {
            kind: "move",
            id: g.id,
            pointerId: rest,
            start: toStory(restPoint),
            orig: { ...current },
            moved: true,
          };
          updateGuides(NO_GUIDES);
          return;
        }
        finish();
        return;
      }

      if (g.pointerId !== event.pointerId) return;
      finish();
    };
  });

  useEffect(() => {
    const move = (event: PointerEvent) => handlers.current.move(event);
    const up = (event: PointerEvent) => handlers.current.up(event);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const selected = useMemo(() => {
    const el = selectedId ? findEl(doc, selectedId) : null;
    return el && !el.hidden ? el : null;
  }, [doc, selectedId]);

  return (
    <div
      ref={shellRef}
      className="stage-grid stage-surface relative h-full min-h-0 p-3"
      onPointerDown={onShellDown}
    >
      <ScaledStory
        fit="contain"
        className="h-full"
        showCropMarks
        overlay={
          <>
            {safeZones ? <SafeZoneOverlay /> : null}
            {dragging && guides.x ? <div className="snap-guide-x" aria-hidden /> : null}
            {dragging && guides.y ? <div className="snap-guide-y" aria-hidden /> : null}
            {selected ? (
              <Handles
                el={selected}
                dragging={dragging}
                pinned={touchGesture}
                angleSnapped={dragging && guides.angle}
                onScale={(event) => onHandleDown(event, "scale")}
                onRotate={(event) => onHandleDown(event, "rotate")}
              />
            ) : null}
            {flash ? <div className="shutter-flash" aria-hidden /> : null}
          </>
        }
      >
        <StoryFrame doc={{ ...doc, elements: [] }}>
          {doc.elements
            .filter((el) => !el.hidden)
            .sort((a, b) => a.z - b.z)
            .map((el) => {
              const active = el.id === selectedId;
              const hovered = el.id === hoveredId && !active;
              return (
                <div
                  key={el.id}
                  role="button"
                  tabIndex={el.locked ? -1 : 0}
                  className={el.locked ? "" : `cursor-grab ${active ? "z-50" : ""}`}
                  style={elementPlacementStyle(el, {
                    zIndex: active ? 50 : el.z,
                    pointerEvents: el.locked ? "none" : undefined,
                  })}
                  onPointerDown={(event) => onElementDown(event, el)}
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
  pinned,
  angleSnapped,
  onScale,
  onRotate,
}: {
  el: StoryElement;
  dragging: boolean;
  /** Touch gestures put the readout at the top of the frame, clear of fingers. */
  pinned: boolean;
  angleSnapped: boolean;
  onScale: (event: React.PointerEvent) => void;
  onRotate: (event: React.PointerEvent) => void;
}) {
  const left = clampPercent((el.x / STORY_W) * 100);
  const top = clampPercent((el.y / STORY_H) * 100);

  return (
    <div className="[--handle-gap:32px] [--handle-diag:18px] [@media(pointer:coarse)]:[--handle-gap:48px] [@media(pointer:coarse)]:[--handle-diag:30px]">
      {dragging ? (
        <div
          className={`pointer-events-none absolute z-50 -translate-x-1/2 whitespace-nowrap rounded-[2px] border bg-bench/95 px-2 py-1 data-mono text-bone shadow-[0_8px_24px_-8px_#000000A6] ${
            angleSnapped ? "border-guide" : "border-rule-strong"
          }`}
          style={
            pinned
              ? { left: "50%", top: 12 }
              : { left: `${left}%`, top: `calc(${top}% + 28px)` }
          }
        >
          x {Math.round(el.x)} · y {Math.round(el.y)} · {el.scale.toFixed(2)}× ·{" "}
          <span className={angleSnapped ? "text-guide" : ""}>
            {Math.round(el.rotation)}°
          </span>
        </div>
      ) : null}
      {pinned && dragging ? null : (
        <>
          <button
            type="button"
            aria-label="Повернути"
            className="absolute z-50 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11"
            style={{ left: `${left}%`, top: `calc(${top}% - var(--handle-gap))` }}
            onPointerDown={onRotate}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-signal bg-bench text-signal shadow-md [@media(pointer:coarse)]:h-8 [@media(pointer:coarse)]:w-8">
              <span className="block h-3 w-3 rounded-full border-[1.5px] border-signal" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Масштаб"
            className="absolute z-50 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11"
            style={{
              left: `calc(${left}% + var(--handle-diag))`,
              top: `calc(${top}% + var(--handle-diag))`,
            }}
            onPointerDown={onScale}
          >
            <span className="block h-2.5 w-2.5 rounded-[1px] border border-bone bg-signal shadow-md [@media(pointer:coarse)]:h-4 [@media(pointer:coarse)]:w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function findEl(doc: StoryDoc, id: string): StoryElement | null {
  return doc.elements.find((item) => item.id === id) ?? null;
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(deg: number): number {
  const wrapped = ((((deg + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
}

function clampPercent(value: number): number {
  return Math.min(97, Math.max(3, value));
}
