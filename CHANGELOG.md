# Changelog

All notable changes to this project are documented here.

## [0.1.0] - 2026-10-20

### Added

- Dimmed markers in rendered blocks for bold, italic, highlight, strikethrough and
  inline code, so text doesn't move when you click into a block.
- Page reference brackets always shown, dimmed.
- TODO and DONE: the checkbox in place of `{{`, followed by a dimmed `[[TODO]]`.
- Aliases show their whole source, with `[` and `](destination)` dimmed.
- Attributes show a dimmed second colon.
- Quotes and callouts draw their box around the text instead of pushing it in,
  with a dimmed `>` or `[[!TYPE]]`.
- Styled editor: while you edit a block, the raw text keeps its formatting with
  the markers dimmed, using only styling that keeps the text's width.
- Settings to switch each part on or off, a width-neutral bold option for
  proportional fonts, and a marker opacity.
