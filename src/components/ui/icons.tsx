import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ title, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconTemplates(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="2" width="8" height="14" />
      <rect x="13" y="4" width="4" height="7" />
    </Icon>
  );
}

export function IconStickers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6.5 10 3l6 3.5V14l-6 3.5L4 14V6.5Z" />
      <path d="M10 3v14.5" />
    </Icon>
  );
}

export function IconText(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5h12" />
      <path d="M10 5v11" />
      <path d="M7 16h6" />
    </Icon>
  );
}

export function IconBackground(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="14" height="14" />
      <path d="M3 13l4-4 3 3 3-4 4 5" />
    </Icon>
  );
}

export function IconMedia(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="14" height="12" />
      <circle cx="7.5" cy="8.5" r="1.5" />
      <path d="M3 14l4-4 3 3 2-2 5 5" />
    </Icon>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 3 3 7l7 4 7-4-7-4Z" />
      <path d="M3 10.5 10 14.5 17 10.5" />
      <path d="M3 13.5 10 17.5 17 13.5" />
    </Icon>
  );
}

export function IconUndo(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 7H4v3" />
      <path d="M4 10a6 6 0 1 0 2-4.5" />
    </Icon>
  );
}

export function IconRedo(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 7h3v3" />
      <path d="M16 10a6 6 0 1 1-2-4.5" />
    </Icon>
  );
}

export function IconAlignLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5h14" />
      <path d="M3 10h10" />
      <path d="M3 15h12" />
    </Icon>
  );
}

export function IconAlignCenter(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5h14" />
      <path d="M5 10h10" />
      <path d="M4 15h12" />
    </Icon>
  );
}

export function IconAlignRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5h14" />
      <path d="M7 10h10" />
      <path d="M5 15h12" />
    </Icon>
  );
}

export function IconItalic(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 4h6" />
      <path d="M5 16h6" />
      <path d="M12 4 8 16" />
    </Icon>
  );
}

export function IconUp(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 15V5" />
      <path d="M6 9l4-4 4 4" />
    </Icon>
  );
}

export function IconDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 5v10" />
      <path d="M6 11l4 4 4-4" />
    </Icon>
  );
}

export function IconDuplicate(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6" y="6" width="10" height="10" />
      <path d="M4 14V4h10" />
    </Icon>
  );
}

export function IconDelete(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h12" />
      <path d="M8 6V4h4v2" />
      <path d="M6 6l1 10h6l1-10" />
    </Icon>
  );
}

export function IconSafeZone(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="2" width="10" height="16" />
      <path d="M5 5h10" />
      <path d="M5 15h10" />
    </Icon>
  );
}

export function IconShare(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="10" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path d="M7 9l6-3" />
      <path d="M7 11l6 3" />
    </Icon>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 3v10" />
      <path d="M6 9l4 4 4-4" />
      <path d="M4 16h12" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 5l10 10" />
      <path d="M15 5 5 15" />
    </Icon>
  );
}

export function IconPhoto(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="14" height="12" />
      <circle cx="7.5" cy="8.5" r="1.25" />
      <path d="M3 13.5 7 10l3 2.5 2-2 5 4" />
    </Icon>
  );
}

export function IconBack(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4 6 10l6 6" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 8 14.5 16 5.5" />
    </Icon>
  );
}

export function IconEdit(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 16h3L16 7l-3-3-9 9v3Z" />
      <path d="M11 6l3 3" />
    </Icon>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10Z" />
      <circle cx="10" cy="10" r="2.25" />
    </Icon>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10Z" />
      <path d="M3.5 16.5 16.5 3.5" />
    </Icon>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="9" width="11" height="8" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </Icon>
  );
}

export function IconUnlock(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="9" width="11" height="8" />
      <path d="M7 9V6.5a3 3 0 0 1 5.8-1" />
    </Icon>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 10h10" />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 10h10" />
      <path d="M10 5v10" />
    </Icon>
  );
}
