import type { ReactNode } from "react";

export type SegmentOption<T extends string> = {
  id: T;
  label: ReactNode;
  title?: string;
};

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className = "",
  size = "md",
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (id: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={`grid border border-rule bg-slab ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={option.title}
            onClick={() => onChange(option.id)}
            className={`relative flex items-center justify-center gap-1 border-r border-rule last:border-r-0 transition-[background,color] duration-[90ms] ease-[var(--ease-snap)] ${
              size === "sm" ? "px-2 py-1.5 text-xs" : "px-2 py-2 text-xs"
            } ${active ? "bg-bone text-table" : "text-ash hover:text-bone"}`}
          >
            {active ? (
              <span
                className="absolute inset-y-0 left-0 w-0.5 bg-signal"
                aria-hidden
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
