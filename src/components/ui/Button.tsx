import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "signal" | "quiet" | "ghost" | "shutter" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const VARIANT: Record<Variant, string> = {
  signal:
    "bg-signal text-proof hover:bg-signal-press active:translate-y-px disabled:opacity-35",
  quiet:
    "bg-slab text-bone border border-rule hover:border-rule-strong active:translate-y-px disabled:opacity-35",
  ghost:
    "bg-transparent text-ash hover:text-bone hover:border-rule-strong border border-transparent active:translate-y-px disabled:opacity-35",
  shutter:
    "h-9 w-9 rounded-full bg-signal text-[10px] font-semibold tracking-wide text-proof hover:bg-signal-press active:translate-y-px disabled:opacity-35",
  danger:
    "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25 active:translate-y-px disabled:opacity-35",
};

export function Button({
  variant = "quiet",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    variant === "shutter"
      ? "inline-flex shrink-0 items-center justify-center transition-[background,transform,opacity] duration-[90ms] ease-[var(--ease-snap)]"
      : "inline-flex items-center justify-center gap-2 rounded-[2px] px-3 py-2 text-sm transition-[background,border-color,color,transform,opacity] duration-[90ms] ease-[var(--ease-snap)]";

  return (
    <button type={type} className={`${base} ${VARIANT[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
