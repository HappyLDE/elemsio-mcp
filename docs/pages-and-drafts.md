# Pages, Drafts, Preview, and Publication

Load this resource for page creation, page-owned content, draft lifecycle, preview, publication, and
structural mutation safety.

## Page creation

`elems_create_page` creates one non-root modern V2 draft page. It accepts a bounded plain-text title,
one safe slug segment, and an optional existing website-owned V2 template ID. Omitting the template
uses the current website-owned effective/default template. It initializes every active locale and
generates drafts, but never publishes.

Duplicate normalized slugs conflict. The tool cannot create or replace a homepage, create a template,
rename/archive/delete a page, or mutate an existing slug. Use `elems_list_pages`, `elems_get_page`,
and the returned effective-template and publication metadata rather than guessing state.

## Canonical edit lifecycle

```text
identify page -> search elements -> inspect one scoped subtree
-> choose the narrowest page-owned mutation target -> write draft
-> read back -> get draft preview -> browser QA
-> publish only when explicitly requested
```

The mutable modern `MdElement` tree is source. Draft and published HTML/CSS are compiled artifacts,
not alternate authoring inputs. Most page element mutations regenerate active-locale drafts and never
publish. `elems_regenerate_page_drafts` is an explicit recovery operation for canonical source whose
draft generation is known to be incomplete; it is not a general rollback.

The preview URL is an existing opaque site-runtime draft route. Treat it as sensitive. Visual QA does
not require authenticated admin/editor manipulation.

## Compare-and-set and publication

Use the latest value, behavior, class, structure, or revision hash from inspection. A conflict means
read the current state and reconsider; never blindly replay a stale write.

`elems_publish_page` is separate and locale-explicit. Read the page immediately before publication and
pass its current `expected_published`, `expected_has_draft_changes=true`, and, when returned,
`draft_revision`. Ambiguous transport outcomes are read-back verified by the server; do not assume
failure and repeat publication blindly.

## Structural safety

For structure, read `elems://docs/markup-v1`. Validate exact markup before mutation and pass it
unchanged. A narrow child insert/delete uses a fresh parent `children_hash` and preserves the parent,
siblings, and unrelated fields.

Full section replacement is destructive when the target has children: every current child subtree is
removed. `suggested_inspection_root != mutation authority`. Keep destructive intent false unless the
user's requested outcome explicitly requires replacing the complete target. For localized or partial
edits, use text/class/attribute/behavior/insert/delete tools and preserve unrelated content.
