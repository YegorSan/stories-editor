// Stickers reach the editor through dangerouslySetInnerHTML, so the browser
// parses them with the HTML parser, not the XML one. Camel-cased SVG tags only
// survive that path if they are in the HTML spec's "adjust SVG tag name" table,
// which stops at SVG 1.1. Anything newer (feDropShadow) is silently lowercased
// into an unknown element, and a filter with no valid primitives renders
// nothing at all.
import { parseFragment } from "parse5";
import { STICKER_SVG } from "../src/lib/stickers.ts";

type Node = { tagName?: string; childNodes?: Node[] };

const authored = new Set<string>();
for (const markup of Object.values(STICKER_SVG)) {
  for (const [, tag] of markup.matchAll(/<([a-zA-Z][\w-]*)/g)) authored.add(tag);
}

const parsed = new Set<string>();
const walk = (node: Node) => {
  if (node.tagName) parsed.add(node.tagName);
  node.childNodes?.forEach(walk);
};
walk(parseFragment(Object.values(STICKER_SVG).join("")) as unknown as Node);

const mangled = [...authored].filter((tag) => tag !== "svg" && !parsed.has(tag));

console.log("authored tags:", [...authored].sort().join(", "));
if (mangled.length) {
  console.error("\nMANGLED BY HTML PARSER:", mangled.join(", "));
  process.exit(1);
}
console.log("\nOK — every tag survives HTML parsing");
