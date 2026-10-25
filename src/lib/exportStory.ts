import { fontFamilyValue } from "./fonts";
import { stickerAsset } from "./stickers";
import {
  STICKER_SIZE,
  STORY_H,
  STORY_W,
  TEXT_LINE_HEIGHT,
  TEXT_MAX_WIDTH,
  type StoryDoc,
  type StoryElement,
  type TextElement,
} from "./types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Не вдалося завантажити зображення"));
    image.src = src;
  });
}

// The bitmap is drawn into a STICKER_SIZE box but the user can scale a sticker
// up, so rasterise the vector well above its layout size to keep gradients and
// hairlines crisp instead of upscaling a 200px image.
const STICKER_RASTER_SCALE = 4;

function svgDataUrl(markup: string): string {
  const raster = STICKER_SIZE * STICKER_RASTER_SCALE;
  const sized = markup.replace("<svg", `<svg width="${raster}" height="${raster}"`);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
}

function paintBackground(ctx: CanvasRenderingContext2D, doc: StoryDoc): void {
  if (doc.background.type === "solid") {
    ctx.fillStyle = doc.background.color;
    ctx.fillRect(0, 0, STORY_W, STORY_H);
    return;
  }

  const angle = ((doc.background.angle - 90) * Math.PI) / 180;
  const gradient = ctx.createLinearGradient(
    STORY_W / 2 - Math.cos(angle) * STORY_W,
    STORY_H / 2 - Math.sin(angle) * STORY_H,
    STORY_W / 2 + Math.cos(angle) * STORY_W,
    STORY_H / 2 + Math.sin(angle) * STORY_H,
  );
  gradient.addColorStop(0, doc.background.from);
  gradient.addColorStop(1, doc.background.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
}

function sorted(elements: StoryElement[]): StoryElement[] {
  return [...elements].sort((a, b) => a.z - b.z);
}

function fontShorthand(el: TextElement): string {
  const italic = el.italic ? "italic " : "";
  return `${italic}${el.weight} ${el.fontSize}px ${fontFamilyValue(el.fontId)}`;
}

// The DOM preview wraps at TEXT_MAX_WIDTH; the canvas has to repeat that by hand
// or the exported PNG drifts from what the user arranged on the stage.
function wrapLines(ctx: CanvasRenderingContext2D, text: string): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(candidate).width > TEXT_MAX_WIDTH) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }

    lines.push(current);
  }

  return lines;
}

async function paintText(
  ctx: CanvasRenderingContext2D,
  el: TextElement,
): Promise<void> {
  const font = fontShorthand(el);
  try {
    await document.fonts.load(font, el.text);
  } catch {
    // A missing webfont only costs fidelity, so fall back to whatever renders.
  }

  ctx.font = font;
  ctx.fillStyle = el.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = el.align;

  const lines = wrapLines(ctx, el.text);
  const blockWidth = lines.reduce(
    (max, line) => Math.max(max, ctx.measureText(line).width),
    0,
  );
  // The preview box shrinks to the longest line, so left/right aligned blocks
  // sit against that box edge rather than the element centre.
  const originX =
    el.align === "left"
      ? -blockWidth / 2
      : el.align === "right"
        ? blockWidth / 2
        : 0;

  const lineHeight = el.fontSize * TEXT_LINE_HEIGHT;
  const firstLineY = -((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, originX, firstLineY + index * lineHeight);
  });
}

async function paintElement(
  ctx: CanvasRenderingContext2D,
  el: StoryElement,
): Promise<void> {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate((el.rotation * Math.PI) / 180);
  ctx.scale(el.scale, el.scale);

  if (el.type === "text") {
    await paintText(ctx, el);
  }

  if (el.type === "sticker") {
    const asset = stickerAsset(el.stickerId);
    const source = asset.src
      ? asset.src
      : asset.svg
        ? svgDataUrl(asset.svg)
        : null;
    if (source) {
      const image = await loadImage(source);
      const half = STICKER_SIZE / 2;
      ctx.drawImage(image, -half, -half, STICKER_SIZE, STICKER_SIZE);
    }
  }

  if (el.type === "photo" && el.src) {
    const image = await loadImage(el.src);
    roundRect(ctx, -el.width / 2, -el.height / 2, el.width, el.height, el.radius);
    ctx.clip();
    coverImage(ctx, image, el.width, el.height);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function coverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;
  let dw = width;
  let dh = height;
  if (imageRatio > boxRatio) {
    dw = height * imageRatio;
  } else {
    dh = width / imageRatio;
  }
  ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
}

export async function exportStoryPng(doc: StoryDoc): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступний");

  paintBackground(ctx, doc);
  for (const el of sorted(doc.elements)) {
    await paintElement(ctx, el);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Не вдалося зібрати PNG"));
      else resolve(blob);
    }, "image/png");
  });
}

export function countEmptyPhotoSlots(doc: StoryDoc): number {
  return doc.elements.filter((el) => el.type === "photo" && !el.src).length;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
