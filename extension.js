// Roam Zen: keep block text in place when a block gets focus.
//
// Roam shows rendered HTML for a block until you click it, then swaps in a
// textarea with the raw markdown. The markers that appear (`**`, `^^`, `__`,
// `~~`, backticks) push the text around. Roam Zen shows those same markers,
// dimmed, in the rendered view, so both views hold the same characters.

const STYLE_ID = "roam-zen-style";
const GLOBAL_CLEANUP_KEY = "__roamZenCleanup";

// Each feature is a body class; its CSS only applies while that class is set.
const FEATURES = [
  {
    id: "markers",
    name: "Formatting markers",
    description: "Show the ** __ ^^ ~~ and backticks around bold, italic, highlighted, struck-through text and inline code.",
    default: true,
  },
  {
    id: "links",
    name: "Links and attributes",
    description: "Always show [[ ]] around page references, even if brackets are hidden, the (url) of an alias, and the second colon of Name::.",
    default: true,
  },
  {
    id: "todo",
    name: "TODO and DONE",
    description: "Show the rest of {{[[TODO]]}} next to the checkbox, so the text after it doesn't move.",
    default: true,
  },
  {
    id: "quotes",
    name: "Quotes and callouts",
    description: "Show the > of a quote and the [[!TYPE]] of a callout, and draw their box around the text instead of pushing it in.",
    default: true,
  },
  {
    id: "flatBold",
    name: "Width-neutral bold",
    description: "Draw bold with a stroke instead of a bold font, so bold text is as wide as in the editor. Useful with proportional fonts; not needed with a monospace font.",
    default: false,
  },
];

const OPACITY_SETTING = "markerOpacity";
const OPACITY_DEFAULT = "0.35";
// The opacity only applies to blocks you aren't editing; the editor shows
// every marker in full. Hidden markers still take up their space.
const OPACITY_HIDDEN = "Hidden";

// Rendered (unfocused) block text. Block references and embeds render another
// block's text, whose markers are not in this block's source, so they are left alone.
const V = ".roam-block";

// Each rendered alias gets the rest of its source, "](destination)", in an
// attribute that CSS shows dimmed after the alias text.
const ALIAS_TAIL = "data-roam-zen-tail";

// The label Roam Zen puts in a callout's first line.
const CALLOUT_LABEL = "roam-zen-callout";

// "[[>]] [[!TYPE]] " at the start of a callout's source, in its parts. The
// type may end in + or -, which makes the callout foldable.
const CALLOUT_PREFIX = /^(\[\[>\]\])(\s*)(\[\[)(![^\]\n]+)(\]\][+-]?)([ \t]*)/;

const marker = (cls, sel, text) => `
  body.roam-zen--${cls} ${V} ${sel}::before,
  body.roam-zen--${cls} ${V} ${sel}::after {
    content: "${text}";
    opacity: var(--roam-zen-marker-opacity);
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    -webkit-text-stroke: 0;
  }
  body.roam-zen--${cls} ${V} .rm-block-ref ${sel}::before,
  body.roam-zen--${cls} ${V} .rm-block-ref ${sel}::after {
    content: none;
  }`;

const CSS = `
  body {
    --roam-zen-marker-opacity: ${OPACITY_DEFAULT};
    /* Words that stand for something, like TODO, are dimmed half as much as
       pure syntax. */
    --roam-zen-word-opacity: min(1, calc(var(--roam-zen-marker-opacity) * 2));
    /* TODO and DONE, which Hidden leaves dimmed. */
    --roam-zen-todo-opacity: var(--roam-zen-word-opacity);
  }

  ${marker("markers", ".rm-bold", "**")}
  ${marker("markers", ".rm-italics", "__")}
  ${marker("markers", ".rm-highlight", "^^")}
  ${marker("markers", "del", "~~")}
  ${marker("markers", "code:not(pre code)", "`")}

  body.roam-zen--links ${V} .rm-alias::before,
  body.roam-zen--links ${V} .rm-alias::after {
    opacity: var(--roam-zen-marker-opacity);
  }
  body.roam-zen--links ${V} .rm-alias::before { content: "["; }
  body.roam-zen--links ${V} .rm-alias::after { content: "]"; }
  body.roam-zen--links ${V} .rm-alias[${ALIAS_TAIL}]::after { content: attr(${ALIAS_TAIL}); }
  body.roam-zen--links ${V} .rm-block-ref .rm-alias::before,
  body.roam-zen--links ${V} .rm-block-ref .rm-alias::after {
    content: none;
  }

  /* Roam renders "Name::" as "Name:"; the second colon comes back dimmed. */
  body.roam-zen--links ${V} .rm-attr-ref::after {
    content: ":";
    opacity: var(--roam-zen-marker-opacity);
    font-weight: normal;
    -webkit-text-stroke: 0;
  }
  body.roam-zen--links ${V} .rm-block-ref .rm-attr-ref::after {
    content: none;
  }

  /* Quotes: Roam's padding and margins are traded for negative margins of the
     same size, so the box is drawn around the text instead of moving it. The
     text then starts where it does in the editor, after a dimmed "> ". On the
     left the box stays narrow, to keep clear of the bullet. */
  body.roam-zen--quotes ${V} blockquote.rm-bq {
    margin: -4px -4px -4px -6px;
    padding: 4px 4px 4px 3px;
    border-left-width: 3px;
  }
  body.roam-zen--quotes ${V} blockquote.rm-bq::before {
    content: "> ";
    opacity: var(--roam-zen-marker-opacity);
  }

  /* Callouts get the same box treatment as quotes. Their first line becomes
     the source again: the icon in place of "[[>]]" (an invisible "[[>]]"
     gives it that width), Roam Zen's label with " [[!TYPE]] ", then the title.
     Everything here only applies once the label is in, so a callout
     Roam Zen can't read keeps Roam's own layout. */
  body.roam-zen--quotes ${V} .rm-callout:has(> .rm-callout__header > .${CALLOUT_LABEL}) {
    margin: -4px -4px -4px -6px;
    padding: 4px 4px 4px 3px;
    border-left-width: 3px;
  }
  body.roam-zen--quotes ${V} .rm-callout__header:has(> .${CALLOUT_LABEL}) {
    display: block;
  }
  body.roam-zen--quotes ${V} .rm-callout__header:has(> .${CALLOUT_LABEL}) > .bp3-popover-wrapper {
    display: inline-block;
    position: relative;
    line-height: inherit;
  }
  body.roam-zen--quotes ${V} .rm-callout__header:has(> .${CALLOUT_LABEL}) > .bp3-popover-wrapper::before {
    content: "[[>]]";
    visibility: hidden;
  }
  body.roam-zen--quotes ${V} .rm-callout__header:has(> .${CALLOUT_LABEL}) > .bp3-popover-wrapper > .bp3-popover-target {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  body.roam-zen--quotes ${V} .rm-callout:has(> .rm-callout__header > .${CALLOUT_LABEL}) .rm-callout__body {
    margin-top: 0;
  }
  .${CALLOUT_LABEL} .rz-m { opacity: var(--roam-zen-marker-opacity); }
  .${CALLOUT_LABEL} .rz-t { opacity: var(--roam-zen-word-opacity); }

  /* The editor shows code in the block's font with no box around it. */
  body.roam-zen--markers ${V} code:not(pre code) {
    font: inherit;
    padding: 0;
    margin: 0;
    border: 0;
    border-radius: 0;
  }

  body.roam-zen--links ${V} .rm-page-ref__brackets {
    display: inline !important;
    visibility: visible !important;
    color: inherit;
    opacity: var(--roam-zen-marker-opacity);
  }

  /* TODO/DONE: Roam Zen adds a label after the checkbox that holds the rest
     of the source, "{{[[TODO]]}}", so the box is exactly as wide as in the
     editor. Its "{{" and "}}" are invisible (the checkbox sits on top of the
     "{{"); the brackets are dimmed and the word less so. */
  body.roam-zen--todo ${V} .rm-checkbox {
    position: relative;
    white-space: nowrap;
  }
  body.roam-zen--todo ${V} .rm-checkbox .check-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: auto;
    height: auto;
    margin: 0;
  }
  /* An invisible "{{" gives the checkbox's label the same width. */
  body.roam-zen--todo ${V} .rm-checkbox .check-container::before {
    content: "{{";
    visibility: hidden;
  }
  /* Centred in the "{{", and shrunk to leave a little room on either side
     when a narrow font makes "{{" smaller than Roam's 12px box. */
  body.roam-zen--todo ${V} .rm-checkbox .checkmark {
    inset: auto;
    top: 50%;
    left: 50%;
    width: min(12px, 100% - 2px);
    height: auto;
    aspect-ratio: 1;
    box-sizing: border-box;
    transform: translate(-50%, -50%);
  }
  /* Roam's tick in proportions of the box instead of pixels, so it still
     fits a shrunk box. */
  body.roam-zen--todo ${V} .rm-checkbox .checkmark::after {
    left: 29%;
    top: 2%;
    width: 42%;
    height: 83%;
  }
  .roam-zen-todo .rz-hide { visibility: hidden; }
  .roam-zen-todo .rz-m { opacity: var(--roam-zen-marker-opacity); }
  .roam-zen-todo .rz-word { opacity: var(--roam-zen-todo-opacity); }
  .roam-zen-todo .rz-word::before { content: "TODO"; }
  .rm-done .roam-zen-todo .rz-word::before { content: "DONE"; }

  body.roam-zen--flatBold ${V} .rm-bold,
  body.roam-zen--flatBold ${V} .rm-attr-ref,
  body.roam-zen--flatBold ${V} .rm-callout__title {
    font-weight: inherit;
    -webkit-text-stroke: 0.04em currentColor;
  }

  /* Editor: the textarea's own text turns transparent and a styled copy of
     it (the mirror) sits right behind it. The caret and selection stay the
     textarea's own. */
  textarea.roam-zen-editing {
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    background-color: transparent !important;
    position: relative;
  }
  textarea.roam-zen-editing::selection {
    color: transparent;
    -webkit-text-fill-color: transparent;
  }
  .roam-zen-mirror {
    position: absolute;
    pointer-events: none;
    overflow: hidden;
    margin: 0;
    border-color: transparent !important;
    border-style: solid;
    background: transparent;
  }
  .roam-zen-mirror .rz-b { -webkit-text-stroke: 0.04em currentColor; }
  .roam-zen-mirror.rz-real-b .rz-b { font-weight: bold; -webkit-text-stroke: 0; }
  .roam-zen-mirror.rz-real-i .rz-i { font-style: italic; }
  /* Quote and callout boxes as in the rendered view, drawn with shadows so
     the mirror keeps the textarea's size. */
  .roam-zen-mirror .rz-k { color: var(--roam-zen-callout-color); }
  .roam-zen-mirror.rz-callout {
    background-color: var(--roam-zen-callout-bg);
    box-shadow:
      -3px 0 0 0 var(--roam-zen-callout-bg),
      4px 0 0 0 var(--roam-zen-callout-bg),
      -6px 0 0 0 var(--roam-zen-callout-bar);
  }
  .roam-zen-mirror.rz-quote {
    background-color: var(--roam-zen-quote-bg);
    box-shadow:
      -3px 0 0 0 var(--roam-zen-quote-bg),
      4px 0 0 0 var(--roam-zen-quote-bg),
      -6px 0 0 0 var(--roam-zen-quote-bar);
  }
  .roam-zen-mirror .rz-h { background-color: var(--inline-highlight-color, #fef09f); }
  .roam-zen-mirror .rz-s { text-decoration: line-through; }
  .roam-zen-mirror .rz-c { background-color: rgba(128, 128, 128, 0.15); border-radius: 3px; }
  .roam-zen-mirror .rz-l { color: var(--roam-zen-link-color); }
`;

// --- TODO labels ----------------------------------------------------------

const TODO_LABEL = "roam-zen-todo";

function addTodoLabels() {
  for (const box of document.querySelectorAll(`${V} .rm-checkbox`)) {
    if (box.querySelector(`:scope > .${TODO_LABEL}`)) continue;
    const label = document.createElement("span");
    label.className = TODO_LABEL;
    label.setAttribute("aria-hidden", "true");
    // The word comes from CSS, so it follows the TODO/DONE class when Roam
    // reuses the element.
    label.innerHTML = '<span class="rz-hide">{{</span><span class="rz-m">[[</span><span class="rz-word"></span><span class="rz-m">]]</span><span class="rz-hide">}}</span>';
    box.append(label);
  }
}

function removeTodoLabels() {
  for (const label of document.querySelectorAll(`.${TODO_LABEL}`)) label.remove();
}

// --- Alias destinations -----------------------------------------------------

// Aliases, [text](destination), in a block's source. The destination can
// hold [[page]] or ((uid)), so its closing ")" is found by counting
// parentheses. Images, ![alt](url), are not aliases.
function findAliases(work) {
  const found = [];
  for (const m of work.matchAll(/(?<![!\[])\[([^\[\]\n]+)\]\(/g)) {
    let depth = 1;
    let end = m.index + m[0].length;
    while (end < work.length && depth > 0) {
      if (work[end] === "(") depth++;
      else if (work[end] === ")") depth--;
      else if (work[end] === "\n") break;
      end++;
    }
    if (depth === 0) found.push({ start: m.index, textEnd: m.index + 1 + m[1].length, end });
  }
  return found;
}

// Reached through this, not bare window, so tools/test-logic.mjs can import the
// module in Node.
const roamAPI = () => globalThis.window?.roamAlphaAPI;

function blockText(block) {
  try {
    const uid = block.id.slice(-9);
    return roamAPI().data.pull("[:block/string]", [":block/uid", uid])?.[":block/string"] ?? null;
  } catch {
    return null;
  }
}

function addAliasTails() {
  const blocks = new Set();
  for (const a of document.querySelectorAll(`${V} .rm-alias:not([${ALIAS_TAIL}])`)) {
    if (!a.closest(".rm-block-ref")) blocks.add(a.closest(V));
  }
  for (const block of blocks) {
    const text = blockText(block);
    const links = [...block.querySelectorAll(".rm-alias")].filter(
      (a) => a.closest(V) === block && !a.closest(".rm-block-ref"),
    );
    // Code is not markup; blank it so an alias-like snippet in it is skipped.
    const work = text === null ? "" : text.replace(/`[^`\n]+`/g, (code) => "\0".repeat(code.length));
    const aliases = findAliases(work);
    // Only when Roam Zen finds the same aliases Roam rendered can each tail
    // go on the right link; otherwise show just the closing bracket.
    const matched = aliases.length === links.length;
    links.forEach((a, k) => {
      a.setAttribute(ALIAS_TAIL, matched ? text.slice(aliases[k].textEnd, aliases[k].end) : "]");
    });
  }
}

function removeAliasTails() {
  for (const a of document.querySelectorAll(`[${ALIAS_TAIL}]`)) a.removeAttribute(ALIAS_TAIL);
}

// --- Callouts --------------------------------------------------------------

function addCalloutLabels() {
  for (const header of document.querySelectorAll(`${V} .rm-callout__header`)) {
    if (header.querySelector(`:scope > .${CALLOUT_LABEL}`) || header.closest(".rm-block-ref")) continue;
    const title = header.querySelector(":scope > .rm-callout__title");
    const text = blockText(header.closest(V));
    const prefix = text?.match(CALLOUT_PREFIX);
    if (!title || !prefix) continue;
    const [, , gap, open, type, close, after] = prefix;
    const label = document.createElement("span");
    label.className = CALLOUT_LABEL;
    label.setAttribute("aria-hidden", "true");
    const part = (cls, content) => {
      const span = document.createElement("span");
      span.className = cls;
      span.textContent = content;
      return span;
    };
    label.append(gap, part("rz-m", open), part("rz-t", type), part("rz-m", close), after);
    header.insertBefore(label, title);
  }
}

function removeCalloutLabels() {
  for (const label of document.querySelectorAll(`.${CALLOUT_LABEL}`)) label.remove();
}

// --- Watching the page ------------------------------------------------------

let observer = null;

// Each decoration: the setting that turns it on, and how to add and remove it.
const DECORATIONS = [
  { feature: "todo", add: addTodoLabels, remove: removeTodoLabels },
  { feature: "links", add: addAliasTails, remove: removeAliasTails },
  { feature: "quotes", add: addCalloutLabels, remove: removeCalloutLabels },
];

const isOn = (feature) => document.body.classList.contains(`roam-zen--${feature}`);

function decorate() {
  for (const d of DECORATIONS) if (isOn(d.feature)) d.add();
}

// Decorations are added in the observer callback, before the browser paints,
// so new blocks never show up without them.
function watchPage() {
  for (const d of DECORATIONS) if (!isOn(d.feature)) d.remove();
  const any = DECORATIONS.some((d) => isOn(d.feature));
  if (any && !observer) {
    observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, subtree: true });
  } else if (!any && observer) {
    observer.disconnect();
    observer = null;
  }
  decorate();
}

function unwatchPage() {
  observer?.disconnect();
  observer = null;
  for (const d of DECORATIONS) d.remove();
}

// --- Editor ---------------------------------------------------------------

const PAIRS = [
  ["**", "b"],
  ["__", "i"],
  ["^^", "h"],
  ["~~", "s"],
];

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Returns one class key per character of a block's raw text, e.g. "b" for a
// bold letter, "m" for a marker character, "" for plain text.
function parse(text) {
  const flags = Array.from({ length: text.length }, () => new Set());
  const mark = (from, to, flag) => {
    for (let k = from; k < to; k++) flags[k].add(flag);
  };

  // Code blocks are edited in CodeMirror, not in this textarea.
  if (text.startsWith("```")) return flags.map(() => "");

  // TODO/DONE and inline code first: nothing inside them is other markup, so
  // they are blanked out for the passes below.
  let work = text;
  const blank = (from, to) => {
    work = work.slice(0, from) + "\0".repeat(to - from) + work.slice(to);
  };
  for (const m of text.matchAll(/\{\{\[\[(?:TODO|DONE)\]\]\}\}/g)) {
    const end = m.index + m[0].length;
    mark(m.index, end, "m");
    blank(m.index, end);
  }
  for (const m of work.matchAll(/`[^`\n]+`/g)) {
    const end = m.index + m[0].length;
    mark(m.index, end, "c");
    mark(m.index, m.index + 1, "m");
    mark(end - 1, end, "m");
    blank(m.index, end);
  }

  // A callout's "[[>]] [[!TYPE]] " and its title, the rest of the first line.
  const callout = work.match(CALLOUT_PREFIX);
  if (callout) {
    const all = callout[0];
    mark(0, all.length, "m");
    const lineEnd = work.indexOf("\n") === -1 ? work.length : work.indexOf("\n");
    mark(all.length, lineEnd, "b");
    mark(all.length, lineEnd, "k");
    blank(0, all.length);
  }

  // A quote's "> ", also at the start of its later lines.
  if (work.startsWith("> ")) {
    for (const m of work.matchAll(/(?:^|\n)> /g)) {
      const at = m.index + m[0].length - 2;
      mark(at, at + 2, "m");
      blank(at, at + 2);
    }
  }

  // An attribute, "Name::" at the start of the block: the name and first
  // colon bold, as Roam renders them, the second colon a marker.
  const attr = work.match(/^[^:\n`*^~]+?::/);
  if (attr) {
    const end = attr[0].length;
    mark(0, end - 1, "b");
    mark(end - 1, end, "m");
    blank(0, end);
  }

  for (const a of findAliases(work)) {
    mark(a.start, a.start + 1, "m");
    mark(a.start + 1, a.textEnd, "l");
    mark(a.textEnd, a.end, "m");
    blank(a.start, a.end);
  }

  for (const [token, flag] of PAIRS) {
    const t = escapeRegExp(token);
    for (const m of work.matchAll(new RegExp(`${t}([\\s\\S]+?)${t}`, "g"))) {
      const end = m.index + m[0].length;
      mark(m.index, m.index + 2, "m");
      mark(end - 2, end, "m");
      // A highlight's background also covers its markers, as in the rendered view.
      mark(flag === "h" ? m.index : m.index + 2, flag === "h" ? end : end - 2, flag);
    }
  }

  const open = [];
  for (const m of work.matchAll(/\[\[|\]\]/g)) {
    if (m[0] === "[[") {
      open.push(m.index);
    } else if (open.length) {
      const start = open.pop();
      mark(start, start + 2, "m");
      mark(m.index, m.index + 2, "m");
      mark(start + 2, m.index, "l");
    }
  }

  // Markers keep the block's own font, colour and decoration.
  return flags.map((set) => {
    if (set.has("m")) for (const f of ["b", "i", "s", "c", "l", "k"]) set.delete(f);
    return [...set].sort().join("");
  });
}

// The computed style of a hidden element, so the mirror can borrow the
// theme's colours for elements Roam only renders outside the editor.
function probe(parent, tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  el.style.cssText = "position: absolute; visibility: hidden;";
  parent.append(el);
  const cs = getComputedStyle(el);
  const look = {
    bg: cs.backgroundColor,
    bar: cs.borderLeftColor,
    accent: cs.getPropertyValue("--callout-color").trim() || cs.borderLeftColor,
  };
  el.remove();
  return look;
}

function render(mirror, text) {
  const keys = parse(text);
  const frag = document.createDocumentFragment();
  for (let k = 0; k < text.length; ) {
    let j = k + 1;
    while (j < text.length && keys[j] === keys[k]) j++;
    const piece = text.slice(k, j);
    if (keys[k]) {
      const span = document.createElement("span");
      span.className = [...keys[k]].map((f) => `rz-${f}`).join(" ");
      span.textContent = piece;
      frag.append(span);
    } else {
      frag.append(piece);
    }
    k = j;
  }
  // A trailing newline only takes up a line in a div when something follows it.
  frag.append("\u200b");
  mirror.replaceChildren(frag);
  mirror.classList.toggle("rz-quote", text.startsWith("> ") && isOn("quotes"));
  const callout = isOn("quotes") && text.match(CALLOUT_PREFIX);
  mirror.classList.toggle("rz-callout", Boolean(callout));
  // The type's colours, read from a hidden callout of that type, once per type.
  const type = callout ? callout[4].slice(1).toLowerCase() : "";
  if (type && mirror.dataset.calloutType !== type) {
    mirror.dataset.calloutType = type;
    const look = probe(mirror.parentNode, "div", `rm-callout rm-callout--${type}`);
    mirror.style.setProperty("--roam-zen-callout-bg", look.bg);
    mirror.style.setProperty("--roam-zen-callout-bar", look.bar);
    mirror.style.setProperty("--roam-zen-callout-color", look.accent);
  }
}

// Whether bold and italic keep every glyph's width in a font (true for most
// monospace fonts). Only then are they safe to use in the mirror. The variant
// faces may not be loaded yet, so they are loaded before measuring; results
// are cached per font.
const fontChecks = new Map();

function checkFont(cs) {
  const font = (style, weight) => `${style} ${weight} ${cs.fontSize} ${cs.fontFamily}`;
  const regular = font(cs.fontStyle, cs.fontWeight);
  if (!fontChecks.has(regular)) {
    const bold = font(cs.fontStyle, "bold");
    const italic = font("italic", cs.fontWeight);
    fontChecks.set(
      regular,
      Promise.all([regular, bold, italic].map((f) => document.fonts.load(f).catch(() => null))).then(() => {
        const ctx = document.createElement("canvas").getContext("2d");
        const sample = "The quick brown fox jumps over the lazy dog 0123456789 MWil";
        const width = (f) => ((ctx.font = f), ctx.measureText(sample).width);
        const base = width(regular);
        return { bold: Math.abs(width(bold) - base) < 0.5, italic: Math.abs(width(italic) - base) < 0.5 };
      }),
    );
  }
  return fontChecks.get(regular);
}

const COPIED = [
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant", "fontStretch",
  "fontFeatureSettings", "fontKerning", "letterSpacing", "wordSpacing", "lineHeight",
  "textTransform", "textIndent", "textAlign", "tabSize", "direction",
  "whiteSpace", "wordBreak", "overflowWrap", "boxSizing",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
];

let editing = null;

function attach(ta) {
  detach();

  const cs = getComputedStyle(ta);
  const mirror = document.createElement("div");
  mirror.className = "roam-zen-mirror";
  mirror.setAttribute("aria-hidden", "true");
  for (const prop of COPIED) mirror.style[prop] = cs[prop];
  mirror.style.color = cs.color;
  checkFont(cs).then((safe) => {
    mirror.classList.toggle("rz-real-b", safe.bold);
    mirror.classList.toggle("rz-real-i", safe.italic);
  });
  const link = document.querySelector(".roam-block .rm-page-ref--link");
  mirror.style.setProperty("--roam-zen-link-color", link ? getComputedStyle(link).color : cs.color);
  // The theme's quote colours, read from a hidden quote next to the textarea.
  const quote = probe(ta.parentNode, "blockquote", "rm-bq");
  mirror.style.setProperty("--roam-zen-quote-bg", quote.bg);
  mirror.style.setProperty("--roam-zen-quote-bar", quote.bar);

  ta.parentNode.insertBefore(mirror, ta);
  editing = { ta, mirror, text: null, caret: ta.style.caretColor, color: cs.color, frame: 0 };
  tick();
}

function detach() {
  if (!editing) return;
  const { ta, mirror, caret, frame } = editing;
  cancelAnimationFrame(frame);
  mirror.remove();
  ta.classList.remove("roam-zen-editing");
  ta.style.caretColor = caret;
  editing = null;
}

// Roam changes the textarea's value without input events (autocomplete,
// hotkeys), so the mirror follows it frame by frame while a block is edited.
function tick() {
  const e = editing;
  if (!e) return;
  if (!e.ta.isConnected) return detach();

  const { ta, mirror } = e;
  if (ta.value !== e.text) {
    e.text = ta.value;
    render(mirror, e.text);
  }

  mirror.style.left = `${ta.offsetLeft}px`;
  mirror.style.top = `${ta.offsetTop}px`;
  mirror.style.width = `${ta.offsetWidth}px`;
  const a = ta.getBoundingClientRect();
  const b = mirror.getBoundingClientRect();
  if (Math.abs(a.left - b.left) > 0.5) mirror.style.left = `${ta.offsetLeft + a.left - b.left}px`;
  if (Math.abs(a.top - b.top) > 0.5) mirror.style.top = `${ta.offsetTop + a.top - b.top}px`;
  mirror.scrollTop = ta.scrollTop;

  // If the mirror wraps onto more lines than the textarea, the styled text
  // would sit away from the caret: fall back to Roam's plain editor for this
  // block. (The textarea can be taller than its text, so only "more" is a
  // reliable sign.)
  const aligned = mirror.scrollHeight <= ta.scrollHeight + 1;
  ta.classList.toggle("roam-zen-editing", aligned);
  ta.style.caretColor = aligned ? e.color : e.caret;
  mirror.style.visibility = aligned ? "visible" : "hidden";

  e.frame = requestAnimationFrame(tick);
}

function onFocusIn(event) {
  if (event.target.matches?.("textarea.rm-block-input")) attach(event.target);
}

function onFocusOut(event) {
  if (editing && event.target === editing.ta) detach();
}

let extensionAPI = null;

function read(id, fallback) {
  const value = extensionAPI.settings.get(id);
  return value === undefined || value === null ? fallback : value;
}

function apply() {
  for (const f of FEATURES) {
    document.body.classList.toggle(`roam-zen--${f.id}`, Boolean(read(f.id, f.default)));
  }
  const opacity = read(OPACITY_SETTING, OPACITY_DEFAULT);
  const hidden = opacity === OPACITY_HIDDEN;
  document.body.style.setProperty("--roam-zen-marker-opacity", hidden ? "0" : opacity);
  // TODO and DONE say what a block is, so Hidden leaves them as dimmed as
  // they are by default.
  if (hidden) document.body.style.setProperty("--roam-zen-todo-opacity", String(Math.min(1, OPACITY_DEFAULT * 2)));
  else document.body.style.removeProperty("--roam-zen-todo-opacity");
  watchPage();
}

let cleanup = null;

async function onload({ extensionAPI: api }) {
  // Depot developer mode reloads this module without calling onunload, which
  // leaves the previous instance's style, listeners and decorations behind.
  if (cleanup) cleanup();
  else window[GLOBAL_CLEANUP_KEY]?.();

  extensionAPI = api;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);

  apply();
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  if (document.activeElement) onFocusIn({ target: document.activeElement });

  const own = () => {
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("focusout", onFocusOut);
    detach();
    unwatchPage();
    style.remove();
    for (const f of FEATURES) document.body.classList.remove(`roam-zen--${f.id}`);
    document.body.style.removeProperty("--roam-zen-marker-opacity");
    document.body.style.removeProperty("--roam-zen-todo-opacity");
    extensionAPI = null;
    if (window[GLOBAL_CLEANUP_KEY] === own) delete window[GLOBAL_CLEANUP_KEY];
    cleanup = null;
  };
  cleanup = own;
  window[GLOBAL_CLEANUP_KEY] = own;

  // Settings start unset, and read() falls back to the defaults until they're
  // stored. They are seeded before the panel is created, because the panel
  // shows each switch as it was at that moment. A failed write only leaves
  // that switch looking off.
  const seeds = FEATURES.map((f) => [f.id, f.default]).concat([[OPACITY_SETTING, OPACITY_DEFAULT]]);
  await Promise.allSettled(
    seeds.filter(([id]) => api.settings.get(id) == null).map(async ([id, value]) => api.settings.set(id, value)),
  );
  // Unloaded or reloaded while the settings were being written.
  if (cleanup !== own) return;

  api.settings.panel.create({
    tabTitle: "Roam Zen",
    settings: [
      ...FEATURES.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        action: {
          type: "switch",
          onChange: () => setTimeout(apply),
        },
      })),
      {
        id: OPACITY_SETTING,
        name: "Marker opacity",
        description: "How visible the markers are in blocks you aren't editing. Hidden keeps their space, so text still doesn't move, and leaves TODO and DONE dimmed. While you edit, every marker is fully visible.",
        action: {
          type: "select",
          items: [OPACITY_HIDDEN, "0.1", "0.2", "0.35", "0.5", "0.75", "1"],
          onChange: () => setTimeout(apply),
        },
      },
    ],
  });
}

function onunload() {
  cleanup?.();
}

export default { onload, onunload };
