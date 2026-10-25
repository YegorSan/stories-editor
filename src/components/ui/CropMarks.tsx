import type { ReactNode } from "react";

export function CropMarksOverlay({
  active = true,
  className = "",
}: {
  active?: boolean;
  className?: string;
}) {
  if (!active) return null;
  return (
    <>
      <span className={`crop-mark crop-mark--tl ${className}`} aria-hidden />
      <span className={`crop-mark crop-mark--tr ${className}`} aria-hidden />
      <span className={`crop-mark crop-mark--bl ${className}`} aria-hidden />
      <span className={`crop-mark crop-mark--br ${className}`} aria-hidden />
    </>
  );
}

export function CropMarksHost({
  children,
  active = false,
  className = "",
  always = false,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
  always?: boolean;
}) {
  return (
    <div
      className={`crop-marks-host ${className}`}
      data-active={always || active ? "true" : undefined}
    >
      {children}
      <CropMarksOverlay active />
    </div>
  );
}
