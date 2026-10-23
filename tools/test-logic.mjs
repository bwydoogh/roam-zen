// Exercises the pure logic in extension.js — the parser that styles the editor
// and the alias finder that feeds the rendered view — without a browser.
//
// The extension only exports { onload, onunload }, so this script builds a
// temporary module with the internals re-exported and imports that. Real DOM
// behaviour still has to be verified in Roam; see DEVELOPMENT.md.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exposed = ["parse", "findAliases", "CALLOUT_PREFIX"];

function buildHarness() {
  const source = readFileSync(join(repoRoot, "extension.js"), "utf8");
  const dir = mkdtempSync(join(tmpdir(), "roam-zen-test-"));
  const file = join(dir, "harness.mjs");

  writeFileSync(file, `${source}\nexport { ${exposed.join(", ")} };\n`, "utf8");

  return { dir, file };
}

const { dir, file } = buildHarness();
const { parse, findAliases, CALLOUT_PREFIX } = await import(pathToFileURL(file).href);
rmSync(dir, { recursive: true, force: true });

let failures = 0;

function check(name, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    return;
  }

  failures += 1;
  console.error(`FAIL ${name}\n  expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}`);
}

// The parser's output as runs of [classes, text]: "" is plain text, "m" a
// marker, "b" bold, "l" a link, and so on (see the rz-* classes).
function runs(text) {
  const keys = parse(text);
  const out = [];
  for (let k = 0; k < text.length; ) {
    let j = k + 1;
    while (j < text.length && keys[j] === keys[k]) j++;
    out.push([keys[k], text.slice(k, j)]);
    k = j;
  }
  return out;
}

// Plain text and the paired markers.
check("plain text", runs("plain text"), [["", "plain text"]]);
check("bold", runs("a **bold** b"), [["", "a "], ["m", "**"], ["b", "bold"], ["m", "**"], ["", " b"]]);
check("italic and strike", runs("__it__ ~~x~~"), [["m", "__"], ["i", "it"], ["m", "__"], ["", " "], ["m", "~~"], ["s", "x"], ["m", "~~"]]);
check("unclosed markers stay plain", runs("**open and ^^also"), [["", "**open and ^^also"]]);

// A highlight's background covers its markers; markers inside keep no bold.
check("bold inside highlight", runs("^^a **b**^^"), [["hm", "^^"], ["h", "a "], ["hm", "**"], ["bh", "b"], ["hm", "**^^"]]);

// Nothing inside inline code is markup.
check("code hides markup", runs("`a **b**`"), [["m", "`"], ["c", "a **b**"], ["m", "`"]]);

// Code blocks are edited in CodeMirror, so they get no styling at all.
check("code block untouched", runs("```js\n**x**```"), [["", "```js\n**x**```"]]);

// Page references, also nested and as a tag.
check("page ref", runs("[[Page]]"), [["m", "[["], ["l", "Page"], ["m", "]]"]]);
check("tag", runs("#[[Two words]]"), [["", "#"], ["m", "[["], ["l", "Two words"], ["m", "]]"]]);
check("nested refs", runs("[[a [[b]]]]"), [["m", "[["], ["l", "a "], ["m", "[["], ["l", "b"], ["m", "]]]]"]]);

// TODO/DONE: braces and brackets are markers, the word is dimmed less.
check("todo", runs("{{[[TODO]]}} x"), [["m", "{{[[TODO]]}}"], ["", " x"]]);
check("done", runs("{{[[DONE]]}}"), [["m", "{{[[DONE]]}}"]]);

// Aliases, whatever their destination.
check("url alias", runs("[text](https://x.y/a_b)"), [["m", "["], ["l", "text"], ["m", "](https://x.y/a_b)"]]);
check("page alias", runs("[text]([[My Page]])"), [["m", "["], ["l", "text"], ["m", "]([[My Page]])"]]);
check("block alias", runs("[text](((abc123xyz)))"), [["m", "["], ["l", "text"], ["m", "](((abc123xyz)))"]]);
check("image is not an alias", runs("![alt](https://x.y/a.png)"), [["", "![alt](https://x.y/a.png)"]]);

// Attributes: name and first colon bold, the second colon a marker.
check("attribute", runs("Author:: x"), [["b", "Author:"], ["m", ":"], ["", " x"]]);
check("no attribute mid-markup", runs("x **a::b**"), [["", "x "], ["m", "**"], ["b", "a::b"], ["m", "**"]]);

// Quotes: every line's "> ".
check("quote", runs("> one\n> two\nthree > x"), [["m", "> "], ["", "one\n"], ["m", "> "], ["", "two\nthree > x"]]);
check("not a quote", runs(">no space"), [["", ">no space"]]);

// Callouts: the prefix as markers, the type dimmed less, the title bold and in
// the callout's colour, the body plain.
check("callout", runs("[[>]] [[!NOTE]] Title\nBody"), [["m", "[[>]] [[!NOTE]] "], ["bk", "Title"], ["", "\nBody"]]);
check("foldable callout", runs("[[>]] [[!TIP]]- T"), [["m", "[[>]] [[!TIP]]- "], ["bk", "T"]]);
check("callout prefix parts", "[[>]] [[!TIP]]- T".match(CALLOUT_PREFIX).slice(1), ["[[>]]", " ", "[[", "!TIP", "]]-", " "]);

// findAliases feeds the rendered view, which pairs the nth alias in the
// source with the nth link on screen, so the count has to be right.
check("alias count", findAliases("[a](x) and [b]([[P]]) and ![c](y) and [d](((u)))").length, 3);
check("alias span", findAliases("see [a](x(y)) end"), [{ start: 4, textEnd: 6, end: 13 }]);
check("unclosed alias", findAliases("[a](x"), []);

if (failures > 0) {
  console.error(`${failures} logic check(s) failed.`);
  process.exit(1);
}

console.log("Logic checks passed.");
