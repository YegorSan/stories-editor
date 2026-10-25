export const STORY_W = 1080;
export const STORY_H = 1920;
export const TEXT_MAX_WIDTH = 900;
export const TEXT_LINE_HEIGHT = 1.1;
export const STICKER_SIZE = 200;

export type Align = "left" | "center" | "right";

export type ElementBase = {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  /** Hidden layers are skipped on the stage previews and in the PNG export. */
  hidden?: boolean;
  /** Locked layers can be selected from the layers list but not dragged. */
  locked?: boolean;
};

export type TextElement = ElementBase & {
  type: "text";
  text: string;
  fontId: string;
  fontSize: number;
  color: string;
  weight: number;
  align: Align;
  italic?: boolean;
};

export type StickerElement = ElementBase & {
  type: "sticker";
  stickerId: string;
};

export type PhotoElement = ElementBase & {
  type: "photo";
  src: string | null;
  width: number;
  height: number;
  radius: number;
};

export type StoryElement = TextElement | StickerElement | PhotoElement;

export type StoryBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number };

export type StoryDoc = {
  background: StoryBackground;
  elements: StoryElement[];
};

export type StickerMeta = {
  id: string;
  name: string;
  /** File in `public/`, e.g. `/stickers/ua/flag.png`. Inline SVG is the fallback. */
  src?: string;
};

export type StickerPack = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  stickers: StickerMeta[];
};

export type StoryTemplate = {
  id: string;
  name: string;
  category: string;
  packId: string;
  doc: StoryDoc;
};
