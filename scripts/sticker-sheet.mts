import sharp from "sharp";
import { STICKER_PACKS, STICKER_SVG } from "../src/lib/stickers.ts";

const CELL = 220;
const PAD = 26;
const HEAD = 34;
const COLS = 6;

const packIds = process.argv.slice(2);
const packs = packIds.length
  ? STICKER_PACKS.filter((pack) => packIds.includes(pack.id))
  : STICKER_PACKS;

const width = COLS * CELL + PAD * 2;
const height =
  packs.reduce(
    (sum, pack) => sum + HEAD + Math.ceil(pack.stickers.length / COLS) * CELL,
    0,
  ) +
  PAD * 2 +
  (packs.length - 1) * 18;

let yCursor = PAD;
const rows = packs
  .map((pack) => {
    const top = yCursor;
    yCursor += HEAD + Math.ceil(pack.stickers.length / COLS) * CELL + 18;
    const title = `<text x="${PAD}" y="${top + 22}" font-family="DejaVu Sans, sans-serif" font-size="18" fill="${pack.accent}">${pack.name} — ${pack.tagline}</text>`;
    const cells = pack.stickers
      .map((sticker, i) => {
        const markup = STICKER_SVG[sticker.id];
        if (!markup) return "";
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = PAD + col * CELL;
        const y = top + HEAD + row * CELL;
        const inner = markup.replace(
          "<svg",
          `<svg x="${x + 10}" y="${y + 6}" width="${CELL - 20}" height="${CELL - 44}"`,
        );
        const label = `<text x="${x + CELL / 2}" y="${y + CELL - 22}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="13" fill="#8A8A96">${sticker.id}</text>`;
        return `<rect x="${x + 4}" y="${y}" width="${CELL - 8}" height="${CELL - 12}" rx="14" fill="#1B1B22"/>${inner}${label}`;
      })
      .join("");
    return title + cells;
  })
  .join("");

const sheet = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#0C0C10"/>${rows}</svg>`;

const out = `/tmp/sticker-sheet-${packIds.join("-") || "all"}.png`;
await sharp(Buffer.from(sheet), { density: 220 }).png().toFile(out);
console.log(out);
