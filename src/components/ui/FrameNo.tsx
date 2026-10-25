export function formatFrameNo(index: number, pad = 3): string {
  const n = Math.max(0, Math.floor(index));
  return `К·${String(n).padStart(pad, "0")}`;
}

export function FrameNo({
  index,
  pad = 3,
  active = false,
  className = "",
}: {
  index: number;
  pad?: number;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`data-mono ${active ? "text-signal" : "text-ash"} ${className}`}
    >
      {formatFrameNo(index, pad)}
    </span>
  );
}
