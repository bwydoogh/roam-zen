# roam-zen

Keeps the text of a block from jumping when you click into it.

## Why

When a block isn't focused, Roam hides its markup: `**bold**` shows as bold
text without the asterisks, `[text](url)` as a link. Click into the block and
all that markup appears again. Words jump to another line, the block grows
taller, and the spot you meant to click is suddenly somewhere else.

roam-zen makes both views show the same characters in the same place. When a
block isn't focused, the markup stays visible but dimmed. When you edit it, the
formatting stays visible too.

## What you'll see

| You type | Without focus you see |
|---|---|
| `**bold**` | the bold text with dimmed `**` around it |
| `__italic__` | the italic text with dimmed `__` |
| `^^highlight^^` | the highlight with dimmed `^^` |
| `~~strikethrough~~` | the struck-through text with dimmed `~~` |
| `` `code` `` | the code with dimmed backticks, in the block's own font |
| `[[page]]` | the link with dimmed brackets |
| `[text](url)` | the link text, with `[` and `](url)` dimmed |
| `Name::` | the bold attribute name with a dimmed extra `:` |
| `{{[[TODO]]}}` | the checkbox, followed by a dimmed `[[TODO]]` |

Brackets and other markup are dimmed the most. Words like TODO and DONE are
dimmed less, so you read "☐ TODO" first.

While you edit a block, the raw text keeps its formatting: bold stays bold,
highlights stay highlighted, links keep their colour, and the markup is dimmed.

## Settings

Everything can be switched on or off under **Settings → roam-zen**:

- **Bold, italic, highlight, strikethrough and inline code markers**
- **Alias destinations** — show the `(url)` of an alias
- **Attribute colons** — show the second colon of `Name::`
- **TODO and DONE** — show the rest of `{{[[TODO]]}}` next to the checkbox
- **Page reference brackets** — always show `[[ ]]`
- **Style the editor** — keep the formatting while you edit
- **Width-neutral bold** (off by default) — see below
- **Marker opacity** — how strongly the markup is dimmed

### Monospace or not?

roam-zen works best with a monospace font. In other fonts, bold letters are
wider than regular ones, so a bold word still shifts a few pixels when you
click. Turn on **Width-neutral bold** to fix that. Bold then looks slightly
different, but takes up the same space as regular text.

For the same reason, italic stays upright while you edit if your font isn't
monospace.

## What still jumps

Some things look nothing like their markup, so they still shift when you click:

- block references `((…))` and embeds
- images and LaTeX
- the older `{{TODO}}` form
- hidden tags such as `#.class`
- quotes (`> …`)

## Installing

roam-zen isn't in Roam Depot yet. Until then you load it through developer
mode:

1. Download this folder.
2. In Roam, go to **Settings → Roam Depot** and click **Enable developer mode**.
3. Click **Load extension** and pick the folder.

> **Roam doesn't start it on its own.** After restarting Roam, load the folder
> again.
