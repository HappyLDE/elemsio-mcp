# Website menu authoring

Use `elems_list_menus` to resolve a menu and inspect its current `revision` before every write. Pass
that exact revision to `elems_manage_menu`; the tool returns refreshed menu readback.

Menu items use the existing ELEMS `MenuItem` model. Preserve custom and external URL destinations with
`destination_type: "url"` and `url`. URL-only inputs remain supported for existing MCP callers.

For a native ELEMS Page destination, pass `destination_type: "page"` and the same-website `page_id`.
The server resolves the Page record and persists its canonical slug in the existing `MenuItem.type`
and `MenuItem.url` fields. An optional `fragment` is stored separately and appended after the
locale-aware Page URL; provide it without a leading `#`. On updates, an omitted fragment preserves the
current value and an empty string removes it. Readback distinguishes Page from Page plus fragment and
includes `page_id`, the canonical slug, and the fragment when present. URL destinations read back as
`type: "url"` with their `url`. Avoid passing a leading-slash route such as `/servicii` for a Page: the
renderer owns the base path and the native destination stores the page slug.

Fragments are limited to 1–128 ASCII letters, digits, `.`, `_`, `~`, `:`, or `-`, starting with a
letter or digit. A leading `#`, slash, query delimiter, control character, markup, or executable value
is rejected. Query-string support is not part of this field. Page destinations without a fragment,
collection destinations, and custom URL destinations retain their existing behavior.

Menu writes remain website/menu scoped, locale-aware for labels and titles, revision-checked, and
compatible with nested menu items. Use the returned tree to verify the result.
