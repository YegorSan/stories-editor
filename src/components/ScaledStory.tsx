"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CropMarksOverlay } from "@/components/ui/CropMarks";
import { STORY_H, STORY_W } from "@/lib/types";

type ScaledStoryProps = {
  children: ReactNode;
  className?: string;
  /** `width` fills the box (9:16 previews). `contain` letterboxes inside a stage. */
  fit?: "width" | "contain";
  /** Sits on the visible frame, not inside the 1080×1920 scaled layer. */
  overlay?: ReactNode;
  showCropMarks?: boolean;
};

export function ScaledStory({
  children,
  className = "",
  fit = "width",
  overlay,
  showCropMarks = false,
}: ScaledStoryProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const measure = () => {
      const { width, height } = shell.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const next =
        fit === "width"
          ? width / STORY_W
          : Math.min(width / STORY_W, height / STORY_H);
      setScale(next > 0 && Number.isFinite(next) ? next : 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [fit]);

  const fitted = scale ?? 1;

  if (fit === "contain") {
    return (
      <div
        ref={shellRef}
        className={`grid h-full min-h-0 w-full place-items-center ${className}`}
      >
        <div
          data-story-frame
          className="relative overflow-visible"
          style={{
            width: STORY_W * fitted,
            height: STORY_H * fitted,
            visibility: scale == null ? "hidden" : "visible",
            boxShadow:
              "0 0 0 1px #00000099, 0 40px 90px -30px #000000B3, 0 0 120px 0 #ECE6DA0D",
          }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <div
              style={{
                width: STORY_W,
                height: STORY_H,
                transform: `scale(${fitted})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
            {overlay}
          </div>
          {showCropMarks ? <CropMarksOverlay /> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`w-full overflow-hidden ${className}`}
      style={{
        aspectRatio: "9 / 16",
        containerType: "inline-size",
      }}
    >
      <div
        style={{
          width: STORY_W,
          height: STORY_H,
          transform: `scale(${scale == null ? `calc(100cqw / ${STORY_W})` : fitted})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
