# Website menu authoring

Create one empty website menu container with `elems_create_menu`, using an active website locale,
bounded display name, and idempotency key. It returns the canonical menu revision and a zero-item
readback. Add or change items only through the existing `elems_manage_menu` lifecycle, reading the
latest revision before each write.

In a V2 template, the canonical provider behavior is `functionType: "menu"` with
`functionData.menuId: "<menu id>"`. Author it through the existing detached template behavior or
Markup V1 tools. A provider reference is accepted only when the menu belongs to the same scoped
website. Desktop and mobile provider elements may reference the same menu container.

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

When `elems_update_page` changes a Page slug, matching native `type: "page"` menu destinations are
updated to the new canonical slug in the same transaction. They continue to resolve to the same Page
ID; custom URL destinations are unaffected.

Fragments are limited to 1–128 ASCII letters, digits, `.`, `_`, `~`, `:`, or `-`, starting with a
letter or digit. A leading `#`, slash, query delimiter, control character, markup, or executable value
is rejected. Query-string support is not part of this field. Page destinations without a fragment,
collection destinations, and custom URL destinations retain their existing behavior.

Menu writes remain website/menu scoped, locale-aware for labels and titles, revision-checked, and
compatible with nested menu items. Use the returned tree to verify the result.
