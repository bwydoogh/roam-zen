# Development

Roam Zen is a Roam Depot-ready extension. The public `README.md` is written for
Roam Depot users; this file contains local development, test, and release notes.

## Files

- `extension.js`: the whole runtime. No build step — this is the shipped artifact.
- `tools/test-logic.mjs`: browser-free checks for the editor parser and the alias
  finder.
- `tools/purge-cdn.mjs`: purges jsDelivr's cache for the `@main` URL Roam loads.
- `dev-server.mjs`: dependency-free local server with CORS headers.

There is no bundler and there are no dependencies. Roam Depot publishes only
`extension.js` and `extension.css` from a repo, so everything lives in one file
rather than in sibling modules that would resolve locally and 404 in production.

## Commands

```sh
npm run check       # syntax check + logic checks
npm run test        # logic checks only
npm run dev         # serve extension.js on http://localhost:8787 with CORS
npm run deploy-dev  # git push + purge jsDelivr's cache for @main
git diff --check    # required pre-commit whitespace check
```

`npm run check` is the gate. It does not touch the DOM: the rendered-view CSS,
the decorations (TODO labels, alias tails, callout labels), and the editor
mirror all require verification in Roam.

## Local test in Roam

### Preferred: load from GitHub through jsDelivr

In Roam Depot development mode choose `Load extension from URL`:

```text
https://cdn.jsdelivr.net/gh/bwydoogh/roam-zen@main/extension.js
```

The loop per change:

```sh
npm run check
git commit -am "..."
npm run deploy-dev
```

Then `View → Reload` in Roam (⌘R). Roam caches an already-imported module for
the session, so a reload is always needed; `View → Force Reload` bypasses
Electron's HTTP cache. A pinned commit can be tested with `@COMMIT_SHA` instead
of `@main`; that URL never needs purging.

### Alternatives

The folder picker (Roam asks again after every app reload), or `npm run dev` and
`Load extension from URL` with `http://localhost:8787/extension.js`.

### Testing without your own graph

Roam's public help graph (`https://roamresearch.com/#/app/help`) accepts edits
locally without saving them, and has blocks for every markup type Roam Zen
handles: callouts on the `Callouts` page, quotes, aliases and TODOs elsewhere.
Use `roamAlphaAPI.data.q` to find a block and `ui.mainWindow.openBlock` to open
its parent.

## Manual test checklist

The parser and the alias finder are covered by `npm run test`. Everything below
is browser-only and must be walked through every release, with a monospace and a
proportional font. For each item, click into the block and back out: the text
must not move.

1. **Markers.** `**bold**`, `__italic__`, `^^highlight^^`, `~~strike~~` and
   `` `code` `` show their markers dimmed without focus.
2. **Page refs.** `[[page]]` and `#[[two words]]` keep their brackets, dimmed.
3. **TODO and DONE.** The checkbox sits where `{{` is, followed by a dimmed
   `[[TODO]]`; ticking it switches the label to DONE. In a proportional font the
   checkbox shrinks to fit `{{` and its tick still fits.
4. **Aliases.** `[text](url)`, `[text]([[Page]])` and `[text](((uid)))` show their
   full source dimmed. A block with an image `![](url)` next to an alias still
   pairs the right destination with each link.
5. **Attributes.** `Name:: value` shows a dimmed second colon.
6. **Quotes.** `> text` keeps its box, the box stays clear of the bullet, and the
   first character sits where it does in the editor.
7. **Callouts.** `[[>]] [[!TIP]] Title` plus a body line: the icon sits where
   `[[>]]` is, the title and body don't move. Try a foldable `[[!TIP]]-` and an
   unknown type.
8. **Editor.** While editing, bold, highlight, strikethrough, code, links,
   aliases, attribute names, quotes and callouts are styled with dimmed markers,
   and the caret stays on its character while typing, also after autocomplete
   (`[[`, `((`) and hotkeys (⌘B, ⌘I).
9. **Width check.** In a proportional font, bold in the editor is drawn with an
   outline and italic stays upright. Turn on **Width-neutral bold** and confirm
   bold no longer shifts.
10. **Block refs.** A `((ref))` to a block with bold, a TODO or a callout shows
    no extra markers inside the reference.
11. **Settings.** Turn each of the four groups off and on without reloading; its
    effect disappears and comes back. Change **Marker opacity**; on **Hidden**,
    rendered markers leave blank space and the editor still shows them.
12. **Themes.** Light and dark Roam themes: markers, quote and callout boxes are
    readable, in the rendered view and in the editor.
13. **Right sidebar and linked references.** Repeat items 1, 3 and 8 there.
14. **Reload.** Reload the extension in developer mode (`ctrl-d ctrl-r`) twice:
    there is one `#roam-zen-style`, and no doubled TODO or callout labels.
15. **Teardown.** Disable the extension: no `roam-zen` classes on `body`, no
    `.roam-zen-mirror`, `.roam-zen-todo` or `.roam-zen-callout` elements, no
    `data-roam-zen-tail` attributes, and Roam's own rendering is back.

## Release checklist

1. `npm run check`.
2. `git diff --check`.
3. Walk the manual test checklist in Roam Depot development mode.
4. Test via `Load extension from URL` against a fixed jsDelivr commit URL.
5. Update `CHANGELOG.md`.
6. Commit and push the final release state.
7. Use the final commit hash in the Roam Depot metadata file.

Roam Depot metadata:

```json
{
  "name": "Roam Zen",
  "short_description": "Keeps the text of a block from jumping when you click into it.",
  "author": "Benny Wydooghe",
  "tags": ["editing", "markdown", "formatting"],
  "source_url": "https://github.com/bwydoogh/roam-zen",
  "source_repo": "https://github.com/bwydoogh/roam-zen.git",
  "source_commit": "FINAL_COMMIT_SHA"
}
```

Submit that metadata as `extensions/bwydoogh/roam-zen.json` in a pull request to
`Roam-Research/roam-depot`.
