import type { ReactNode } from "react";

export function Label({
  children,
  className = "",
  tone = "ash",
}: {
  children: ReactNode;
  className?: string;
  tone?: "ash" | "bone" | "signal" | "proof";
}) {
  const toneClass =
    tone === "bone"
      ? "text-bone"
      : tone === "signal"
        ? "text-signal"
        : tone === "proof"
          ? "text-proof-ink"
          : "text-ash";

  return <p className={`label-condensed ${toneClass} ${className}`}>{children}</p>;
}
