"use client";

import type { CSSProperties } from "react";
import { stickerAsset } from "@/lib/stickers";

type StickerMarkProps = {
  id: string;
  className?: string;
  style?: CSSProperties;
};

export function StickerMark({ id, className, style }: StickerMarkProps) {
  const { src, svg } = stickerAsset(id);

  if (src) {
    return (
      // File stickers (PNG/SVG in /public) beat inline markup so a designer
      // can drop art in without touching the React tree.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`sticker-mark block h-full w-full object-contain ${className ?? ""}`}
        style={style}
      />
    );
  }

  if (!svg) {
    return (
      <div
        className={`grid place-items-center bg-slab text-xs text-ash ${className ?? ""}`}
        style={style}
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={`sticker-mark ${className ?? ""}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
