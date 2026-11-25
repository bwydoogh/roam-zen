# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Changed

- While you type, the styled editor only updates the part of the text that
  changed, so other extensions that watch the page have less to process.
- Width-neutral bold is on by default and only applies when the font's bold is
  wider than its regular, as in Roam's default font. Fonts whose bold has the
  same width keep their real bold.

### Fixed

- Tags of several words, `#[[two words]]`, no longer move the text after them;
  they show as `[[#two words]]` with dimmed brackets.
- The later lines of a quote over several lines keep their place.
- The older `{{TODO}}` and `{{DONE}}` forms no longer move the text after them.

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
