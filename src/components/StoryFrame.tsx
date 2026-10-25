import type { CSSProperties, ReactNode } from "react";
import { fontVar } from "@/lib/fonts";
import {
  STICKER_SIZE,
  STORY_H,
  STORY_W,
  TEXT_LINE_HEIGHT,
  TEXT_MAX_WIDTH,
  type StoryBackground,
  type StoryDoc,
  type StoryElement,
} from "@/lib/types";
import { ScaledStory } from "./ScaledStory";
import { StickerMark } from "./StickerMark";

export function backgroundStyle(bg: StoryBackground): CSSProperties {
  if (bg.type === "solid") {
    return { background: bg.color };
  }
  return {
    background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`,
  };
}

export function elementPlacementStyle(
  el: StoryElement,
  extra?: CSSProperties,
): CSSProperties {
  return {
    position: "absolute",
    left: `${el.x}px`,
    top: `${el.y}px`,
    width: "max-content",
    maxWidth: el.type === "text" ? TEXT_MAX_WIDTH : undefined,
    justifySelf: "start",
    alignSelf: "start",
    // Individual CSS transform properties compose after `transform` and would
    // skip the -50% centering if a utility sets them.
    translate: "none",
    rotate: "none",
    scale: "none",
    transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scale})`,
    zIndex: el.z,
    ...extra,
  };
}

export function StoryFrame({
  doc,
  children,
}: {
  doc: StoryDoc;
  children?: ReactNode;
}) {
  return (
    <div
      className="story-frame relative overflow-hidden"
      style={{
        width: STORY_W,
        height: STORY_H,
        ...backgroundStyle(doc.background),
      }}
    >
      {doc.elements
        .filter((el) => !el.hidden)
        .sort((a, b) => a.z - b.z)
        .map((el) => (
          <div key={el.id} style={elementPlacementStyle(el)}>
            <ElementVisual el={el} />
          </div>
        ))}
      {children}
    </div>
  );
}

export function ElementVisual({ el }: { el: StoryElement }) {
  if (el.type === "sticker") {
    return (
      <StickerMark
        id={el.stickerId}
        className="shrink-0"
        style={{ width: STICKER_SIZE, height: STICKER_SIZE }}
      />
    );
  }

  if (el.type === "photo") {
    return (
      <div
        className="overflow-hidden bg-bone/10"
        style={{
          width: el.width,
          height: el.height,
          borderRadius: el.radius,
        }}
      >
        {el.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={el.src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="photo-slot-empty flex h-full w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-[#21C4E0]/70 text-[#21C4E0]">
            <span className="font-mono text-5xl tracking-wide">+ фото</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <p
      className="inline-block whitespace-pre-wrap"
      style={{
        fontFamily: fontVar(el.fontId),
        color: el.color,
        fontSize: el.fontSize,
        fontWeight: el.weight,
        fontStyle: el.italic ? "italic" : "normal",
        textAlign: el.align,
        lineHeight: TEXT_LINE_HEIGHT,
        maxWidth: TEXT_MAX_WIDTH,
      }}
    >
      {el.text}
    </p>
  );
}

export function StoryPreview({
  doc,
  className = "",
}: {
  doc: StoryDoc;
  className?: string;
}) {
  return (
    <ScaledStory className={className} fit="width">
      <StoryFrame doc={doc} />
    </ScaledStory>
  );
}
