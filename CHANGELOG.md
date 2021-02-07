# Change Log

## 1.2.0

- Changes
  - When command-clicking a column/card to open a link, previously it was always opened externally; now only http/https and mailto URIs are opened externally, and all other links are opened in editor tabs.
- Bugfixes
  - Adding or editing a link on a level 3 heading was previously not being reflected on the board unless you refreshed.

## 1.1.0

- Additions
  - If a column or card title contains links (in the `[title](href)` syntax), command-clicking it instead opens the first link.

## 1.0.0

- Additions
  - You can now drag cards or columns around to rearrange them (the Markdown document will be updated).
- Bugfixes
  -  Headings of level 3 or more should not be treated as cards, lines with no space after the `#` or `##` should not be treated as headings.

## 0.0.1

- Initial release