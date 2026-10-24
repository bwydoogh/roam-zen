# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

- `npm run check` — the gate: `node --check` on both sources plus `tools/test-logic.mjs`. Runs no browser.
- `npm run test` — logic checks only.
- `npm run dev` — serve `extension.js` on `http://localhost:8787` with CORS, for `Load extension from URL`.
- `npm run deploy-dev` — `git push` plus a purge of jsDelivr's cache for the `@main` URL Roam loads.
- `git diff --check` — required pre-commit whitespace check.

## Architecture

Single-file, no bundler, no dependencies. Roam Depot publishes only `extension.js`
and `extension.css` from a repo, so a sibling module would resolve in developer mode
and via jsDelivr and then 404 in production. `extension.js` is the shipped artifact
and is edited directly — there is no `src/` and no build step.

The goal is that a block's text sits at exactly the same spot with and without
focus. Three parts work towards that:

- **Rendered view: CSS.** Markers come back through `::before`/`::after` on the
  elements Roam renders, each feature scoped by a `roam-zen--<id>` class on `body`.
- **Rendered view: decorations.** What CSS can't know comes from the block's source
  through `roamAlphaAPI`: the TODO label, an alias's `](destination)` (in a
  `data-roam-zen-tail` attribute) and a callout's ` [[!TYPE]] ` label. One
  `MutationObserver` adds them in its callback, before the browser paints.
- **Editor: the mirror.** The focused textarea's text turns transparent and a styled
  copy (`.roam-zen-mirror`) sits right behind it, rebuilt from `parse()` and kept in
  step frame by frame.

### Things that are easy to get wrong

- **Only width-neutral styling, anywhere.** Every change must keep each character
  where the textarea puts it: colour, opacity, background, decoration, outlines and
  shadows are fine; padding, margins, font size, weight and style are not, unless
  they are traded for an equal negative margin (quotes, callouts) or proven
  width-safe for the font (`checkFont`, real bold/italic in the mirror only).
- **The mirror must never wrap differently from the textarea.** `tick` compares
  heights and falls back to Roam's plain editor when the mirror needs more lines.
  Don't remove that check; it's what keeps a misaligned mirror from leaving styled
  text away from the caret.
- **Never assign `textarea.value` and never write the block.** Roam Zen only reads.
  Roam changes the textarea without `input` events (autocomplete, hotkeys), which is
  why the mirror polls in `requestAnimationFrame` rather than listening.
- **Alias destinations are paired by position.** `addAliasTails` matches the nth
  alias in the source to the nth `.rm-alias` on screen, and gives up (only `]`) when
  the counts differ. `findAliases` must skip what Roam doesn't render as an alias
  (images, code) or every later alias in the block gets the wrong destination.
- **Decorations live inside Roam's DOM.** TODO and callout labels are appended to
  Roam's elements, and Roam may replace those elements at any time; the observer
  adds labels to new ones. Labels must stay idempotent (skip when present), and all
  layout changes that depend on a label are scoped with `:has(> label)` so a callout
  Roam Zen can't read keeps Roam's own layout.
- **Roam measures a copy of the block to place the caret.** On a click, Roam
  renders the block again in a `#span-portal` on `body`, one span per source
  character, and takes the character nearest the click. `V` matches that copy
  too, so it gets the same CSS. Decorations never reach it, because Roam creates
  and removes it within one event. A decoration that changes width needs a
  stand-in there, or clicks after it land off: static CSS for the TODO label,
  and per-click CSS from `portalCSS` (written on a capturing `mousedown`, before
  Roam's handler) for alias tails and callout labels.
- **Block refs show another block's text.** Markers and decorations are skipped
  inside `.rm-block-ref`, whose source isn't this block's.
- **Reach the API through `roamAPI()`, not bare `window`.** `tools/test-logic.mjs`
  imports this module in Node, where `window` is undefined. Module top-level code
  must never touch the DOM for the same reason.
- **Cleanup must be idempotent.** `onload` first calls the module-local `cleanup`,
  falling back to `window.__roamZenCleanup` from a previous module instance, because
  Depot dev mode reloads the module on file change without calling `onunload`.

## Testing

`tools/test-logic.mjs` appends a re-export line to `extension.js` in a temp directory
and imports that (the extension itself only exports `{ onload, onunload }`). It
covers the editor parser for every markup type and the alias finder's count and
spans.

It covers no DOM behaviour. The rendered-view CSS, the decorations, the mirror's
alignment and teardown are browser-only — the manual checklist in `DEVELOPMENT.md`
is the source of truth for those.

## Release

Releases are pinned commits referenced from `extensions/bwydoogh/roam-zen.json` in
the `Roam-Research/roam-depot` repo. The release checklist in `DEVELOPMENT.md` is the
source of truth.
