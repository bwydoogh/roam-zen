# Changelog

All notable changes to this project are documented here.

## [0.1.0] - 2026-10-24

### Added

- Dimmed markers in rendered blocks for bold, italic, highlight, strikethrough and
  inline code, so text doesn't move when you click into a block.
- Page reference brackets always shown, dimmed.
- TODO and DONE: the checkbox in place of `{{`, followed by a dimmed `[[TODO]]`.
- Aliases show their whole source, with `[` and `](destination)` dimmed.
- Attributes show a dimmed second colon.
- Quotes and callouts draw their box around the text instead of pushing it in,
  with a dimmed `>` or `[[!TYPE]]`.
- Clicking into a block puts the caret on the character you clicked, also after
  markers, a TODO, an alias or a callout's label.
- Styled editor: while you edit a block, the raw text keeps its formatting with
  the markers fully visible, using only styling that keeps the text's width.
- Settings to switch formatting markers, links and attributes, TODO and DONE,
  and quotes and callouts on or off, a width-neutral bold option for
  proportional fonts, and a marker opacity, down to hidden.
