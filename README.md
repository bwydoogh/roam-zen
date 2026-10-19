# roam-zen

Stops Roam Research block text from jumping when you click into a block.

When a block is not focused, Roam hides markdown markers like `**`, `^^` and `__`. When you click into it, Roam swaps in a text editor that shows them again, and the text reflows. roam-zen shows those markers, dimmed, in the rendered view as well, so both views contain the same characters and the text stays where it is.

## What it covers

| Markup | Rendered view shows |
| --- | --- |
| `**bold**` | dimmed `**` around the bold text |
| `__italic__` | dimmed `__` |
| `^^highlight^^` | dimmed `^^` |
| `~~strikethrough~~` | dimmed `~~` |
| `` `code` `` | dimmed backticks; the code box and its padding are removed |
| `[[page]]` | brackets always shown, dimmed like the other markers |
| `[text](url)` | the whole source: the alias text as a link, `[`, `](url)` dimmed |
| `Name::` | the bold `Name:` plus a dimmed second `:` |
| `{{[[TODO]]}}` / `{{[[DONE]]}}` | the checkbox in place of `{{`, then `[[TODO]]` with the brackets dimmed and the word less so; the `}}` keeps its space but is invisible. TODO and the text after it stay where they are in the editor |

Each one can be switched off in the extension's settings. The marker opacity is adjustable; words like TODO are dimmed half as much.

**Width-neutral bold** (off by default): with a proportional font, bold letters are wider than regular ones, so a bold word or attribute name still shifts a little when you click in. This option draws bold with a stroke instead, so bold keeps the regular width. Monospace fonts don't need it.

## Styled editor

While you edit a block, roam-zen also styles the raw text: bold, highlight, strikethrough, inline code, page links, aliases and attribute names look like they do in the rendered view, with the markers (and `{{[[TODO]]}}`) dimmed. Switch it off with **Style the editor**.

It works by making the editor's own text transparent and drawing a styled copy right behind it; the caret and selection stay Roam's. Styling that would change the width of the text is skipped, so nothing moves:

- Bold and italic use the font's real bold and italic faces only when they are as wide as the regular face (true for most monospace fonts). Otherwise bold is drawn with a stroke and italic is left upright.
- If the styled copy still wraps onto more lines than the editor, roam-zen falls back to Roam's plain editor for that block.

## What it can't fix

Markup whose source looks nothing like its rendered form still shifts: block references `((uid))`, embeds, the older `{{TODO}}` form, images, LaTeX and hidden tags such as `#.class`.

## Install for development

1. Open a graph, then **Settings → Roam Depot → Enable developer mode**.
2. Click **Load extension** and pick this folder.
3. After changing `extension.js`, press `ctrl-d ctrl-r` (or reload it from **Settings → Roam Depot → Developer Extensions**).

Extensions loaded from a local folder don't start on their own: after you reload Roam, load the folder again.
