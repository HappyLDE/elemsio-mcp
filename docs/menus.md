# Website menu authoring

Use `elems_list_menus` to resolve a menu and inspect its current `revision` before every write. Pass
that exact revision to `elems_manage_menu`; the tool returns refreshed menu readback.

Menu items use the existing ELEMS `MenuItem` model. Preserve custom and external URL destinations with
`destination_type: "url"` and `url`. URL-only inputs remain supported for existing MCP callers.

For a native ELEMS Page destination, pass `destination_type: "page"` and the same-website `page_id`.
The server resolves the Page record and persists its canonical slug in the existing `MenuItem.type`
and `MenuItem.url` fields. Readback distinguishes it as `type: "page"` and includes `page_id`; URL
destinations read back as `type: "url"` with their `url`. Avoid passing a leading-slash route such as
`/servicii` for a Page: the renderer owns the base path and the native destination stores the page
slug.

The ELEMS menu model and menu editor expose Page, collection, and custom URL destinations. They do
not expose a Page section or anchor destination. Do not invent page-plus-anchor semantics.

Menu writes remain website/menu scoped, locale-aware for labels and titles, revision-checked, and
compatible with nested menu items. Use the returned tree to verify the result.
