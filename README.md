# Roam Zen

Keeps the text of a block from jumping when you click into it.

## Why

When a block isn't focused, Roam hides its markup: `**bold**` shows as bold
text without the asterisks, `[text](url)` as a link. Click into the block and
all that markup appears again. Words jump to another line, the block grows
taller, and the spot you meant to click is suddenly somewhere else.

Roam Zen makes both views show the same characters in the same place. When a
block isn't focused, the markup is still there, dimmed or even hidden, so it
takes up the same space. When you edit it, the formatting stays visible too.

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
| `> quote` | the quote with a dimmed `>`, its box drawn around the text |
| `[[>]] [[!TIP]] Title` | the callout's icon, a dimmed `[[!TIP]]` and the title, its box drawn around the text |

Brackets and other markup are dimmed the most. TODO, DONE and a callout's
type are dimmed less, so you read "☐ TODO" first. How strongly is up to you,
see **Marker opacity** below.

While you edit a block, the raw text keeps its formatting: bold stays bold,
highlights stay highlighted, links keep their colour, and the markup is fully
visible. With **Quotes and callouts** on, quotes and callouts keep their box.

## Settings

Find them under **Settings → Roam Zen**. All five are on by default; turn
one of the first four off and Roam hides that markup again without focus, so it
jumps when you click:

- **Formatting markers** — show `**` `__` `^^` `~~` and backticks
- **Links and attributes** — always show `[[ ]]`, the `(url)` of an alias and
  the second colon of `Name::`
- **TODO and DONE** — show the rest of `{{[[TODO]]}}` next to the checkbox
- **Quotes and callouts** — show the `>` of a quote and the `[[!TIP]]` of a
  callout
- **Width-neutral bold** — keeps bold text as wide as regular text when your
  font needs it, see below
- **Marker opacity** — how strongly the markup is dimmed in blocks you aren't
  editing. **Hidden** hides it but keeps its space, so text still doesn't move;
  TODO and DONE stay dimmed. While you edit, the markup is always fully
  visible.

### Monospace or not?

Roam Zen works best with a monospace font. In other fonts, such as Roam's
default, bold letters are wider than regular ones, so a bold word would shift a
few pixels when you click. **Width-neutral bold** fixes that by itself: when
your font's bold is wider, bold looks slightly different but takes up the same
space as regular text. When it isn't, as in most monospace fonts, you keep the
font's real bold. Turn the setting off to always see the real bold.

For the same reason, italic stays upright while you edit if your font isn't
monospace.

## What still jumps

Some things look nothing like their markup, so they still shift when you click:

- block references `((…))` and embeds
- images and LaTeX
- hidden tags such as `#.class`
- a one-word tag written as `#[[tag]]`; a tag of several words doesn't
  jump, but `#[[two words]]` shows as `[[#two words]]`

In a quote over several lines, the later lines keep their place but don't show
their `>`. Clicking on one of those lines can put the caret a few characters
before the spot you clicked; that is a limitation in Roam itself.
