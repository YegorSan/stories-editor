import type { StickerPack } from "./types";

// Stickers are inlined into one document, so local ids like `#g` would collide.
// Bodies use short ids; they are namespaced per sticker on the way out.
function scopeIds(id: string, body: string): string {
  return body
    .replace(/id="([\w-]+)"/g, `id="${id}-$1"`)
    .replace(/url\(#([\w-]+)\)/g, `url(#${id}-$1)`)
    .replace(/href="#([\w-]+)"/g, `href="#${id}-$1"`);
}

const n = (value: number) => Math.round(value * 10) / 10;

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// feDropShadow is SVG 2 — the HTML parser lowercases it and the sticker vanishes
// in the editor. These SVG 1.1 primitives survive both parsers.
function dropShadow(color: string, opacity: number, dy: number, blur: number): string {
  return `<filter id="s" x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/><feOffset dy="${dy}" result="o"/><feFlood flood-color="${color}" flood-opacity="${opacity}"/><feComposite in2="o" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

const TYPE = `font-family="DejaVu Sans, Arial, Helvetica, sans-serif"`;
const SERIF = `font-family="DejaVu Serif, Georgia, 'Times New Roman', serif"`;

const UA_BLUE = "#0057B8";
const UA_YELLOW = "#FFD700";
const INK = "#14110C";
const PAPER = "#F4EFE6";
const ROSE = "#E11D48";
const GOLD_HI = "#F8E7B6";
const GOLD_MID = "#C89B3D";

const SHADOW = dropShadow("#120E08", 0.42, 5, 6);
const GOLD = `<linearGradient id="g" x1="28" y1="12" x2="172" y2="188" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".22" stop-color="#E8C36A"/><stop offset=".48" stop-color="#A07A28"/><stop offset=".7" stop-color="#E4BE72"/><stop offset="1" stop-color="#C9A44A"/></linearGradient>`;
const CHROME = `<linearGradient id="c" x1="100" y1="8" x2="100" y2="192" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".22" stop-color="#D4E4F4"/><stop offset=".48" stop-color="#2A3544"/><stop offset=".7" stop-color="#F2F7FC"/><stop offset="1" stop-color="#D7C09A"/></linearGradient>`;
const PETAL = `<linearGradient id="p" x1="100" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFE56A"/><stop offset=".55" stop-color="#F5C400"/><stop offset="1" stop-color="#D4A000"/></linearGradient>`;
const PEONY = `<radialGradient id="p" cx="100" cy="108" r="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD0DC"/><stop offset=".45" stop-color="#F4729A"/><stop offset="1" stop-color="#BE123C"/></radialGradient>`;

function star4(cx: number, cy: number, size: number, fill: string): string {
  const s = size / 2;
  return `<path d="M${cx} ${cy - s}C${cx + s * 0.12} ${cy - s * 0.12} ${cx + s * 0.12} ${cy + s * 0.12} ${cx + s} ${cy}C${cx + s * 0.12} ${cy + s * 0.12} ${cx - s * 0.12} ${cy + s * 0.12} ${cx} ${cy + s}C${cx - s * 0.12} ${cy + s * 0.12} ${cx - s * 0.12} ${cy - s * 0.12} ${cx - s} ${cy}C${cx - s * 0.12} ${cy - s * 0.12} ${cx + s * 0.12} ${cy - s * 0.12} ${cx} ${cy - s}Z" fill="${fill}"/>`;
}

function sunflower(): string {
  const petals = Array.from({ length: 18 }, (_, i) => {
    const a = (360 / 18) * i;
    return `<ellipse cx="100" cy="44" rx="12" ry="34" transform="rotate(${n(a)} 100 100)" fill="url(#p)"/>`;
  }).join("");
  const seeds = Array.from({ length: 48 }, (_, i) => {
    const ring = 7 + (i % 4) * 6.2;
    const a = (i / 48) * 360 * 2.4;
    const [x, y] = polar(100, 100, ring, a);
    return `<circle cx="${n(x)}" cy="${n(y)}" r="2.1" fill="${i % 2 ? "#2A1A0C" : "#5C3A18"}"/>`;
  }).join("");
  return `<defs>${PETAL}${SHADOW}</defs>
    <g filter="url(#s)">
      ${petals}
      <circle cx="100" cy="100" r="34" fill="#6B4220"/>
      <circle cx="100" cy="100" r="30" fill="#8B5A2B"/>
      ${seeds}
    </g>`;
}

function kalyna(): string {
  const berries: [number, number, number][] = [
    [100, 86, 16],
    [78, 98, 15],
    [122, 96, 15],
    [88, 118, 14],
    [114, 120, 14],
    [66, 82, 12],
    [134, 80, 12],
    [100, 140, 13],
    [84, 70, 11],
    [118, 68, 11],
  ];
  const fruit = berries
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#C81E3A"/><circle cx="${x - r * 0.28}" cy="${y - r * 0.3}" r="${r * 0.28}" fill="#FF6B81" opacity=".85"/>`,
    )
    .join("");
  return `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M40 86C40 48 72 28 100 28C86 52 78 64 88 86" fill="#2F6B3A"/>
      <path d="M160 78C148 42 118 26 100 28C118 54 128 64 120 86" fill="#3E8A4A"/>
      <path d="M100 28C92 70 96 90 100 168" fill="none" stroke="#2A5A32" stroke-width="5" stroke-linecap="round"/>
      ${fruit}
    </g>`;
}

function vyshyvanka(): string {
  const red = "#C8102E";
  const black = "#1A1A1A";
  const diamond = (cx: number, cy: number, s: number, color: string) =>
    `<path d="M${cx} ${cy - s}L${cx + s} ${cy}L${cx} ${cy + s}L${cx - s} ${cy}Z" fill="${color}"/>`;
  const star = (cx: number, cy: number, r: number, color: string) => {
    const pts = Array.from({ length: 8 }, (_, i) => {
      const [x, y] = polar(cx, cy, i % 2 === 0 ? r : r * 0.4, -90 + i * 45);
      return `${n(x)},${n(y)}`;
    });
    return `<polygon points="${pts.join(" ")}" fill="${color}"/>`;
  };
  const border = Array.from({ length: 12 }, (_, i) => {
    const t = (i / 12) * 6.28;
    const x = 100 + Math.cos(t) * 72;
    const y = 100 + Math.sin(t) * 72;
    return diamond(n(x), n(y), 7, i % 2 ? black : red);
  }).join("");
  return `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="22" y="22" width="156" height="156" rx="18" fill="#F7F1E3"/>
      <rect x="32" y="32" width="136" height="136" fill="none" stroke="${red}" stroke-width="3"/>
      <rect x="40" y="40" width="120" height="120" fill="none" stroke="${black}" stroke-width="1.5"/>
      ${border}
      ${diamond(100, 100, 52, red)}
      ${diamond(100, 100, 38, "#F7F1E3")}
      ${star(100, 100, 28, black)}
      ${star(100, 100, 16, red)}
      ${diamond(100, 48, 8, black)}
      ${diamond(100, 152, 8, black)}
      ${diamond(48, 100, 8, black)}
      ${diamond(152, 100, 8, black)}
    </g>`;
}

function wheat(): string {
  const grains = Array.from({ length: 11 }, (_, i) => {
    const y = 46 + i * 10;
    const side = i % 2 === 0 ? -1 : 1;
    const x = 100 + side * (10 + (i % 3));
    const rot = side * (38 - i);
    const awnX = x + side * 22;
    const awnY = y - 18;
    return `<ellipse cx="${x}" cy="${y}" rx="8" ry="14" transform="rotate(${rot} ${x} ${y})" fill="url(#g)"/>
      <path d="M${x} ${y}L${awnX} ${awnY}" stroke="#8A671C" stroke-width="1.4" stroke-linecap="round"/>`;
  }).join("");
  return `<defs>${GOLD}${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M100 40L100 184" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
      ${grains}
      <ellipse cx="100" cy="36" rx="7" ry="12" fill="url(#g)"/>
    </g>`;
}

function peony(): string {
  const rings = [0, 1, 2, 3]
    .flatMap((ring) => {
      const count = 7 + ring * 2;
      const dist = 18 + ring * 14;
      const rx = 16 - ring;
      const ry = 28 - ring * 2;
      return Array.from({ length: count }, (_, i) => {
        const a = (360 / count) * i + ring * 12;
        return `<ellipse cx="100" cy="${100 - dist}" rx="${rx}" ry="${ry}" transform="rotate(${n(a)} 100 108)" fill="url(#p)" opacity="${0.72 + ring * 0.06}"/>`;
      });
    })
    .join("");
  return `<defs>${PEONY}${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M42 150C28 120 48 96 78 108C70 138 58 158 42 150Z" fill="#2F6B3A"/>
      <path d="M168 142C178 112 148 90 122 108C138 138 156 156 168 142Z" fill="#3E8A4A"/>
      ${rings}
      <circle cx="100" cy="110" r="14" fill="#FDE68A"/>
      <circle cx="96" cy="106" r="3" fill="#BE123C"/>
      <circle cx="106" cy="112" r="2.4" fill="#BE123C"/>
      <circle cx="100" cy="116" r="2" fill="#9F1239"/>
    </g>`;
}

const BODIES: Record<string, string> = {
  "ua-flag": `<defs>${GOLD}${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M36 28C36 22 42 18 48 20L176 36C184 37 186 48 180 54L176 58L180 100L176 104L180 148C184 156 176 164 168 162L48 146C42 145 36 140 36 134V28Z" fill="#FFFFFF"/>
      <path d="M44 30C44 28 46 26 48 27L168 42C172 43 172 48 170 50L44 78V30Z" fill="${UA_BLUE}"/>
      <path d="M44 78L170 50C174 64 176 86 170 104L44 132V78Z" fill="${UA_YELLOW}"/>
      <rect x="30" y="22" width="10" height="158" rx="4" fill="#2A2118"/>
      <circle cx="35" cy="20" r="6" fill="url(#g)"/>
    </g>`,

  "ua-tryzub": `<defs>${GOLD}${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M100 10L168 10C178 10 186 18 186 28V92C186 136 148 166 100 190C52 166 14 136 14 92V28C14 18 22 10 32 10Z" fill="${UA_BLUE}"/>
      <path d="M100 18L160 18C168 18 174 24 174 32V90C174 128 142 154 100 176C58 154 26 128 26 90V32C26 24 32 18 40 18Z" fill="none" stroke="url(#g)" stroke-width="3"/>
      <path fill="url(#g)" fill-rule="evenodd" d="M100 32C108 32 114 36 116 46L132 42C140 40 148 46 148 56L146 72L164 76C174 78 180 88 178 100L168 156C166 166 156 172 146 170L136 166V112H122V168C122 176 114 182 104 182H96C86 182 78 176 78 168V112H64V166L54 170C44 172 34 166 32 156L22 100C20 88 26 78 36 76L54 72L52 56C52 46 60 40 68 42L84 46C86 36 92 32 100 32ZM100 62L110 70L124 64L122 82L136 90L122 98V128H78V98L64 90L78 82L76 64L90 70Z"/>
    </g>`,

  "ua-sunflower": sunflower(),
  "ua-kalyna": kalyna(),
  "ua-vyshyvanka": vyshyvanka(),
  "ua-wheat": wheat(),

  "ua-slava": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M18 78H182L166 100L182 122H18L34 100Z" fill="${UA_BLUE}"/>
      <path d="M30 86H170L158 100L170 114H30L42 100Z" fill="${UA_YELLOW}"/>
      <text x="100" y="96" text-anchor="middle" font-size="15" font-weight="800" ${TYPE} fill="${INK}" letter-spacing="0.6">СЛАВА УКРАЇНІ</text>
      <text x="100" y="114" text-anchor="middle" font-size="11" font-weight="700" ${TYPE} fill="${INK}" letter-spacing="1.2">ГЕРОЯМ СЛАВА</text>
    </g>`,

  "ua-vechir": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M22 40H178C186 40 192 46 192 54V128C192 136 186 142 178 142H86L58 168L64 142H22C14 142 8 136 8 128V54C8 46 14 40 22 40Z" fill="${PAPER}"/>
      <path d="M22 40H178C186 40 192 46 192 54V70H8V54C8 46 14 40 22 40Z" fill="${UA_BLUE}"/>
      <text x="100" y="62" text-anchor="middle" font-size="13" font-weight="800" ${TYPE} fill="${UA_YELLOW}" letter-spacing="0.4">ДОБРОГО ВЕЧОРА</text>
      <text x="100" y="108" text-anchor="middle" font-size="16" font-weight="800" ${TYPE} fill="${INK}">ми з України</text>
    </g>`,

  "ua-will": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="16" y="58" width="168" height="84" rx="42" fill="${UA_YELLOW}"/>
      <rect x="22" y="64" width="156" height="72" rx="36" fill="${UA_BLUE}"/>
      <text x="100" y="96" text-anchor="middle" font-size="14" font-weight="700" ${TYPE} fill="${PAPER}">усе буде</text>
      <text x="100" y="118" text-anchor="middle" font-size="18" font-weight="800" ${TYPE} fill="${UA_YELLOW}">УКРАЇНА</text>
    </g>`,

  "ua-bori": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M24 44H176V150L160 158L148 148L132 160L116 148L100 158L84 148L68 160L52 148L40 158L24 148Z" fill="#F3E6C8"/>
      <path d="M24 44H176V62H24Z" fill="${UA_BLUE}"/>
      <text x="100" y="58" text-anchor="middle" font-size="11" font-weight="700" ${TYPE} fill="${UA_YELLOW}" letter-spacing="2">ШЕВЧЕНКО</text>
      <text x="100" y="102" text-anchor="middle" font-size="17" font-weight="700" ${SERIF} fill="${INK}">Борітеся —</text>
      <text x="100" y="128" text-anchor="middle" font-size="17" font-weight="700" ${SERIF} fill="${INK}">поборете</text>
    </g>`,

  "ua-heart": `<defs>${SHADOW}
      <clipPath id="h"><path d="M100 178C38 134 20 104 20 74C20 44 44 26 70 26C86 26 96 34 100 44C104 34 114 26 130 26C156 26 180 44 180 74C180 104 162 134 100 178Z"/></clipPath>
    </defs>
    <g filter="url(#s)">
      <path d="M100 178C38 134 20 104 20 74C20 44 44 26 70 26C86 26 96 34 100 44C104 34 114 26 130 26C156 26 180 44 180 74C180 104 162 134 100 178Z" fill="#FFFFFF"/>
      <g clip-path="url(#h)">
        <rect x="12" y="18" width="176" height="80" fill="${UA_BLUE}"/>
        <rect x="12" y="98" width="176" height="90" fill="${UA_YELLOW}"/>
      </g>
    </g>`,

  "col-polaroid": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="32" y="16" width="136" height="168" rx="6" fill="#FFFAF2"/>
      <rect x="44" y="28" width="112" height="112" fill="#D7D0C4"/>
      <path d="M44 28H156V140H44Z" fill="none" stroke="#C4B8A8" stroke-width="1"/>
      <rect x="70" y="158" width="60" height="8" rx="4" fill="#E8DFD2"/>
    </g>`,

  "col-tape": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M12 78L20 70H180L188 78L180 130H20Z" fill="#F2D0A4" opacity=".95"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${28 + i * 18} 70L${12 + i * 18} 130" stroke="#E11D48" stroke-width="5" opacity=".55"/>`).join("")}
      <path d="M20 70L12 78L20 130" fill="none" stroke="#E8C48A" stroke-width="2"/>
      <path d="M180 70L188 78L180 130" fill="none" stroke="#E8C48A" stroke-width="2"/>
    </g>`,

  "col-note": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M36 24H164V150L150 158L138 148L122 160L106 148L90 160L74 148L58 158L36 148Z" fill="#FFF8E8"/>
      ${[56, 76, 96, 116, 136].map((y) => `<path d="M50 ${y}H150" stroke="#9BC4E2" stroke-width="1.6"/>`).join("")}
      <path d="M62 24V148" stroke="#E11D48" stroke-width="2" opacity=".55"/>
    </g>`,

  "col-clip": `<defs>${CHROME}${SHADOW}</defs>
    <g filter="url(#s)" fill="none" stroke="url(#c)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <path d="M78 48C78 36 88 28 100 28C112 28 122 36 122 48V128C122 152 106 168 86 168C66 168 52 152 52 128V64C52 48 64 38 78 38C92 38 102 48 102 64V120C102 128 96 134 88 134C80 134 74 128 74 120V72"/>
    </g>`,

  "col-stamp": `<defs>${GOLD}${SHADOW}</defs>
    <g filter="url(#s)">
      <circle cx="100" cy="100" r="78" fill="#7A1F2B"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="url(#g)" stroke-width="4"/>
      <circle cx="100" cy="100" r="54" fill="none" stroke="url(#g)" stroke-width="1.2" opacity=".6"/>
      <text x="100" y="92" text-anchor="middle" font-size="13" font-weight="700" ${TYPE} fill="url(#g)" letter-spacing="3">KYIV</text>
      <text x="100" y="128" text-anchor="middle" font-size="22" font-weight="800" ${TYPE} fill="url(#g)">26 08</text>
    </g>`,

  "col-film": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="28" y="36" width="144" height="128" rx="8" fill="#14110C"/>
      ${[48, 80, 112, 144].map((y) => `<rect x="36" y="${y}" width="10" height="12" rx="2" fill="#F4EFE6"/><rect x="154" y="${y}" width="10" height="12" rx="2" fill="#F4EFE6"/>`).join("")}
      <rect x="54" y="52" width="92" height="28" fill="#3A342C"/>
      <rect x="54" y="86" width="92" height="28" fill="#C4B8A8"/>
      <rect x="54" y="120" width="92" height="28" fill="#3A342C"/>
    </g>`,

  "flora-peony": peony(),

  "flora-bow": `<defs>${SHADOW}
      <linearGradient id="r" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FDA4AF"/><stop offset=".5" stop-color="#E11D48"/><stop offset="1" stop-color="#9F1239"/></linearGradient>
    </defs>
    <g filter="url(#s)">
      <path d="M100 92C48 28 8 70 36 112C54 130 82 118 100 100Z" fill="url(#r)"/>
      <path d="M100 92C152 28 192 70 164 112C146 130 118 118 100 100Z" fill="url(#r)"/>
      <path d="M90 104L58 176L86 162L102 118Z" fill="#9F1239"/>
      <path d="M110 104L142 176L114 162L98 118Z" fill="#BE123C"/>
      <ellipse cx="100" cy="100" rx="18" ry="16" fill="#FB7185"/>
      <ellipse cx="100" cy="96" rx="10" ry="6" fill="#FECDD3" opacity=".8"/>
    </g>`,

  "flora-lips": `<defs>${SHADOW}
      <linearGradient id="r" x1="40" y1="60" x2="160" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FB7185"/><stop offset=".5" stop-color="#E11D48"/><stop offset="1" stop-color="#9F1239"/></linearGradient>
    </defs>
    <g filter="url(#s)">
      <path d="M28 108C36 72 70 58 100 72C130 58 164 72 172 108C164 148 128 168 100 158C72 168 36 148 28 108Z" fill="url(#r)"/>
      <path d="M36 108C70 96 130 96 164 108" fill="none" stroke="#4A0514" stroke-width="3" opacity=".45"/>
      <path d="M62 92C78 80 90 86 100 96" fill="none" stroke="#FECDD3" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    </g>`,

  "flora-spark": `<defs>${GOLD}${SHADOW}</defs>
    <g filter="url(#s)">
      ${star4(96, 86, 128, "url(#g)")}
      ${star4(156, 148, 44, GOLD_MID)}
      ${star4(48, 150, 32, GOLD_HI)}
    </g>`,

  "flora-cherry": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M100 36C92 70 70 96 48 118" fill="none" stroke="#2F6B3A" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 36C108 72 132 94 154 112" fill="none" stroke="#2F6B3A" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 36C118 48 140 44 156 38" fill="none" stroke="#3E8A4A" stroke-width="4" stroke-linecap="round"/>
      <circle cx="48" cy="132" r="32" fill="#C81E3A"/>
      <circle cx="154" cy="124" r="30" fill="#BE123C"/>
      <ellipse cx="40" cy="122" rx="10" ry="7" fill="#FB7185" opacity=".8"/>
      <ellipse cx="144" cy="114" rx="9" ry="6" fill="#FB7185" opacity=".8"/>
    </g>`,

  "flora-ribbon": `<defs>${SHADOW}
      <linearGradient id="r" x1="20" y1="80" x2="180" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FDA4AF"/><stop offset=".5" stop-color="#E11D48"/><stop offset="1" stop-color="#9F1239"/></linearGradient>
    </defs>
    <g filter="url(#s)">
      <path d="M12 118C44 48 80 48 100 100C120 152 156 152 188 82" fill="none" stroke="url(#r)" stroke-width="28" stroke-linecap="round"/>
      <path d="M12 118C44 48 80 48 100 100C120 152 156 152 188 82" fill="none" stroke="#FECDD3" stroke-width="8" opacity=".45" stroke-linecap="round"/>
    </g>`,

  "neon-moon": `<defs>${GOLD}${SHADOW}</defs>
    <g filter="url(#s)">
      <circle cx="108" cy="100" r="70" fill="${PAPER}"/>
      <circle cx="132" cy="82" r="58" fill="#12221F"/>
      ${star4(40, 44, 18, "#C6FF3D")}
      ${star4(168, 150, 14, "#C6FF3D")}
      ${star4(36, 156, 10, PAPER)}
    </g>`,

  "neon-vinyl": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <circle cx="100" cy="100" r="84" fill="#14110C"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="#2A2A28" stroke-width="2"/>
      <circle cx="100" cy="100" r="56" fill="none" stroke="#2A2A28" stroke-width="2"/>
      <circle cx="100" cy="100" r="42" fill="none" stroke="#2A2A28" stroke-width="2"/>
      <circle cx="100" cy="100" r="26" fill="#C6FF3D"/>
      <circle cx="100" cy="100" r="8" fill="#14110C"/>
    </g>`,

  "neon-spark": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      ${star4(92, 88, 120, "#C6FF3D")}
      ${star4(154, 52, 36, PAPER)}
      ${star4(150, 154, 28, ROSE)}
    </g>`,

  "neon-today": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="14" y="64" width="172" height="72" rx="14" fill="#C6FF3D"/>
      <text x="100" y="110" text-anchor="middle" font-size="28" font-weight="800" ${TYPE} fill="#12221F">сьогодні</text>
    </g>`,

  "neon-arrow": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M28 150C48 86 92 52 156 44L150 20L192 64L140 96L146 70C100 78 68 108 52 154Z" fill="#C6FF3D"/>
    </g>`,

  "neon-frame": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M24 24h60v14H38v46H24V24zm152 0h-60v14h46v46h14V24zM24 176h60v-14H38v-46H24v60zm152 0h-60v-14h46v-46h14v60z" fill="#C6FF3D"/>
    </g>`,

  "drop-tag": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M28 44H128L180 100L128 156H28V44Z" fill="#C6FF3D"/>
      <circle cx="54" cy="100" r="10" fill="${INK}"/>
      <text x="112" y="110" text-anchor="middle" font-size="28" font-weight="800" ${TYPE} fill="${INK}">−40%</text>
    </g>`,

  "drop-sale": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M100 12l24 50 54 8-40 38 12 54-50-30-50 30 12-54-40-38 54-8z" fill="${ROSE}"/>
      <text x="100" y="112" text-anchor="middle" font-size="22" font-weight="800" ${TYPE} fill="${PAPER}">SALE</text>
    </g>`,

  "drop-fire": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M100 16c10 30-24 42-8 76 8-12 24-10 28 6 24-20 44 6 28 42-12 34-54 54-78 28-28-30-12-74 30-152z" fill="${ROSE}"/>
      <path d="M96 92c4 16-10 22-2 40 16-8 30 6 20 24-20 10-42-6-32-30 6-16 12-22 14-34z" fill="#C6FF3D"/>
    </g>`,

  "drop-new": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="22" y="72" width="156" height="56" rx="10" transform="rotate(-8 100 100)" fill="${INK}"/>
      <text x="100" y="110" text-anchor="middle" font-size="32" font-weight="800" ${TYPE} fill="#C6FF3D" transform="rotate(-8 100 100)">НОВЕ</text>
    </g>`,

  "drop-bag": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <path d="M52 76h96l10 96H42Z" fill="${PAPER}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M76 76c0-30 48-30 48 0" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="100" cy="124" r="10" fill="#C6FF3D"/>
    </g>`,

  "drop-hot": `<defs>${SHADOW}</defs>
    <g filter="url(#s)">
      <rect x="16" y="64" width="168" height="72" rx="36" fill="#C6FF3D"/>
      <text x="100" y="112" text-anchor="middle" font-size="40" font-weight="800" ${TYPE} fill="${INK}">ХІТ</text>
    </g>`,
};

export const STICKER_SVG: Record<string, string> = Object.fromEntries(
  Object.entries(BODIES).map(([id, body]) => [
    id,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">${scopeIds(id, body)}</svg>`,
  ]),
);

export const STICKER_PACKS: StickerPack[] = [
  // Drawn art: add `src: "/stickers/<pack>/<file>.png"` on a sticker and drop
  // the file in public/stickers/. Inline SVG below is the fallback.
  {
    id: "ua",
    name: "Воля",
    tagline: "Прапор, тризуб, калина, цитати — український кадр",
    accent: UA_YELLOW,
    stickers: [
      { id: "ua-flag", name: "Прапор", src: "/stickers/ua/ua-flag.png" },
      { id: "ua-tryzub", name: "Тризуб" },
      { id: "ua-heart", name: "Серце", src: "/stickers/ua/ua-heart.png" },
      { id: "ua-sunflower", name: "Соняшник", src: "/stickers/ua/ua-sunflower.png" },
      { id: "ua-kalyna", name: "Калина", src: "/stickers/ua/ua-kalyna.png" },
      { id: "ua-vyshyvanka", name: "Вишиванка" },
      { id: "ua-wheat", name: "Колос" },
      { id: "ua-slava", name: "Слава Україні" },
      { id: "ua-vechir", name: "Доброго вечора" },
      { id: "ua-will", name: "Усе буде Україна" },
      { id: "ua-bori", name: "Борітеся" },
    ],
  },
  {
    id: "collage",
    name: "Колаж",
    tagline: "Плівка, скотч, полароїд, печатка — зібрати руками",
    accent: "#E8C36A",
    stickers: [
      { id: "col-polaroid", name: "Полароїд" },
      { id: "col-tape", name: "Скотч" },
      { id: "col-note", name: "Нотатка" },
      { id: "col-clip", name: "Скріпка" },
      { id: "col-stamp", name: "Київ" },
      { id: "col-film", name: "Плівка" },
    ],
  },
  {
    id: "flora",
    name: "Сад",
    tagline: "Півонія, бант, вишні, стрічка — живий декор",
    accent: ROSE,
    stickers: [
      { id: "flora-peony", name: "Півонія" },
      { id: "flora-bow", name: "Бант" },
      { id: "flora-lips", name: "Губи" },
      { id: "flora-spark", name: "Іскра" },
      { id: "flora-cherry", name: "Вишні" },
      { id: "flora-ribbon", name: "Стрічка" },
    ],
  },
  {
    id: "neon",
    name: "Неон",
    tagline: "Місяць, вініл, стрілка — нічний кадр",
    accent: "#C6FF3D",
    stickers: [
      { id: "neon-moon", name: "Місяць" },
      { id: "neon-vinyl", name: "Вініл" },
      { id: "neon-spark", name: "Спалах" },
      { id: "neon-today", name: "Сьогодні" },
      { id: "neon-arrow", name: "Стрілка" },
      { id: "neon-frame", name: "Кадр" },
    ],
  },
  {
    id: "drop",
    name: "Дроп",
    tagline: "Знижка, хіт, нове — для анонсів і розпродажів",
    accent: ROSE,
    stickers: [
      { id: "drop-tag", name: "−40%" },
      { id: "drop-sale", name: "Sale" },
      { id: "drop-fire", name: "Вогонь" },
      { id: "drop-new", name: "Нове" },
      { id: "drop-bag", name: "Шопер" },
      { id: "drop-hot", name: "Хіт" },
    ],
  },
];

export function stickerSvg(id: string): string | undefined {
  return STICKER_SVG[id];
}

export function stickerAsset(id: string): { src?: string; svg?: string } {
  const src = STICKER_PACKS.flatMap((pack) => pack.stickers).find(
    (sticker) => sticker.id === id,
  )?.src;
  return { src, svg: STICKER_SVG[id] };
}

export function allStickerIds(): string[] {
  return Object.keys(STICKER_SVG);
}
