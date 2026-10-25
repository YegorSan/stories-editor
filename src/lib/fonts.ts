import {
  Amatic_SC,
  Anton,
  Archivo_Black,
  Bad_Script,
  Bebas_Neue,
  Caveat,
  Comfortaa,
  Cormorant,
  Exo_2,
  Fira_Sans,
  Forum,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Jura,
  Literata,
  Lobster,
  Manrope,
  Marck_Script,
  Montserrat,
  Nunito,
  Oswald,
  PT_Serif,
  Pacifico,
  Philosopher,
  Playfair_Display,
  Prata,
  Raleway,
  Rubik,
  Ruslan_Display,
  Russo_One,
  Syne,
  Tenor_Sans,
  Unbounded,
  Yeseva_One,
} from "next/font/google";

export type FontCategory = "display" | "sans" | "serif" | "script";

export type StoryFont = {
  id: string;
  label: string;
  cssVar: string;
  category: FontCategory;
  /** Google ships no Cyrillic subset, so Ukrainian text falls back to a system face. */
  latinOnly?: boolean;
};

// next/font only accepts literal arguments, so every call below is spelled out.
// The two UI faces preload; the rest set `preload: false` and are fetched only
// once a story element (or the font picker) references their CSS variable.

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
});
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  preload: false,
});
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const russo = Russo_One({
  variable: "--font-russo",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});
const firaSans = Fira_Sans({
  variable: "--font-fira",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});
const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});
const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});
const amatic = Amatic_SC({
  variable: "--font-amatic",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});
const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const forum = Forum({
  variable: "--font-forum",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const tenorSans = Tenor_Sans({
  variable: "--font-tenor",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const yeseva = Yeseva_One({
  variable: "--font-yeseva",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const badScript = Bad_Script({
  variable: "--font-bad-script",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const marckScript = Marck_Script({
  variable: "--font-marck",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
const ruslan = Ruslan_Display({
  variable: "--font-ruslan",
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const LOADED_FONTS = [
  plexSans,
  plexMono,
  unbounded,
  manrope,
  literata,
  playfair,
  caveat,
  oswald,
  montserrat,
  comfortaa,
  russo,
  rubik,
  raleway,
  nunito,
  exo2,
  jura,
  cormorant,
  firaSans,
  ptSerif,
  philosopher,
  amatic,
  prata,
  forum,
  tenorSans,
  yeseva,
  pacifico,
  lobster,
  badScript,
  marckScript,
  ruslan,
  anton,
  bebas,
  archivoBlack,
  syne,
];

/** Every font variable, for the `<html>` className in the root layout. */
export const fontVariables = LOADED_FONTS.map((font) => font.variable).join(" ");

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: "display", label: "Дисплей" },
  { id: "sans", label: "Гротеск" },
  { id: "serif", label: "Антиква" },
  { id: "script", label: "Рукописні" },
];

export const STORY_FONTS: StoryFont[] = [
  { id: "unbounded", label: "Unbounded", cssVar: "--font-unbounded", category: "display" },
  { id: "russo", label: "Russo One", cssVar: "--font-russo", category: "display" },
  { id: "yeseva", label: "Yeseva One", cssVar: "--font-yeseva", category: "display" },
  { id: "ruslan", label: "Ruslan Display", cssVar: "--font-ruslan", category: "display" },
  { id: "oswald", label: "Oswald", cssVar: "--font-oswald", category: "display" },
  { id: "philosopher", label: "Philosopher", cssVar: "--font-philosopher", category: "display" },
  { id: "jura", label: "Jura", cssVar: "--font-jura", category: "display" },
  { id: "exo2", label: "Exo 2", cssVar: "--font-exo2", category: "display" },
  { id: "comfortaa", label: "Comfortaa", cssVar: "--font-comfortaa", category: "display" },
  { id: "anton", label: "Anton", cssVar: "--font-anton", category: "display", latinOnly: true },
  { id: "bebas", label: "Bebas Neue", cssVar: "--font-bebas", category: "display", latinOnly: true },
  {
    id: "archivo-black",
    label: "Archivo Black",
    cssVar: "--font-archivo-black",
    category: "display",
    latinOnly: true,
  },
  { id: "syne", label: "Syne", cssVar: "--font-syne", category: "display", latinOnly: true },

  { id: "manrope", label: "Manrope", cssVar: "--font-manrope", category: "sans" },
  { id: "montserrat", label: "Montserrat", cssVar: "--font-montserrat", category: "sans" },
  { id: "rubik", label: "Rubik", cssVar: "--font-rubik", category: "sans" },
  { id: "raleway", label: "Raleway", cssVar: "--font-raleway", category: "sans" },
  { id: "nunito", label: "Nunito", cssVar: "--font-nunito", category: "sans" },
  { id: "fira", label: "Fira Sans", cssVar: "--font-fira", category: "sans" },
  { id: "tenor", label: "Tenor Sans", cssVar: "--font-tenor", category: "sans" },

  { id: "playfair", label: "Playfair", cssVar: "--font-playfair", category: "serif" },
  { id: "cormorant", label: "Cormorant", cssVar: "--font-cormorant", category: "serif" },
  { id: "prata", label: "Prata", cssVar: "--font-prata", category: "serif" },
  { id: "forum", label: "Forum", cssVar: "--font-forum", category: "serif" },
  { id: "pt-serif", label: "PT Serif", cssVar: "--font-pt-serif", category: "serif" },

  { id: "caveat", label: "Caveat", cssVar: "--font-caveat", category: "script" },
  { id: "pacifico", label: "Pacifico", cssVar: "--font-pacifico", category: "script" },
  { id: "lobster", label: "Lobster", cssVar: "--font-lobster", category: "script" },
  { id: "bad-script", label: "Bad Script", cssVar: "--font-bad-script", category: "script" },
  { id: "marck", label: "Marck Script", cssVar: "--font-marck", category: "script" },
  { id: "amatic", label: "Amatic SC", cssVar: "--font-amatic", category: "script" },
];

export function findFont(fontId: string): StoryFont {
  return STORY_FONTS.find((item) => item.id === fontId) ?? STORY_FONTS[0];
}

export function fontVar(fontId: string): string {
  return `var(${findFont(fontId).cssVar})`;
}

export function fontFamilyValue(fontId: string): string {
  const font = findFont(fontId);
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(font.cssVar)
    .trim();
  // Canvas rejects the whole `font` shorthand on an unquoted multi-word family.
  return `${raw || `"${font.label}"`}, sans-serif`;
}
