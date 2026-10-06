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

## Canonical Page SEO (MCP 1.53.0)

`elems_get_page` includes `page.seo` for the selected locale (the Website default when omitted).
It returns only SEO state: Website/Page/locale IDs, `title`, `meta_description`, `media_id`, canonical
public Media URL and variants, `document_title`, `seo_hash`, `canonical_url`, `og_url`, site/domain
identity, and publication state/revisions including the published SEO snapshot. An inactive locale,
foreign Page or a missing own translation is rejected; SEO readback never silently borrows another
locale's authored values.

Use `elems_update_page_seo` with `website_id`, `page_id`, explicit `locale`, the fresh
`expected_seo_hash` from readback, and one or more of `title`, `meta_description`, `media_id`.
Omitted fields are preserved. Title and description accept up to 250 characters of plain authoring
text, including Romanian Unicode, quotes, ampersands and angle brackets; Runtime escapes them.
Empty text clears that field. `media_id: null` clears the image. Unknown fields, arbitrary URLs,
foreign Media and protected ResourceAsset identities are rejected. The Media must be a canonical
same-Website public image in its Media Library storage namespace; replacing or clearing the
association never deletes either Media record.

The stored title is a **page title** interpreted with the existing Website `pageTitleFormat`:
`disabled`, `website_name_page_title`, or `page_title_website_name`. Read `document_title` before
publishing. Already branded titles with the site name at either separator boundary are preserved,
preventing duplicate branding. With no title, Runtime falls back to the Website name. No secondary
locale's title or description is copied by the SEO operation.

The update serializes under the canonical translation's MySQL row lock. A stale conflicting patch
returns CONFLICT. A same-value retry returns `already_applied` without changing unrelated values or
publication state. Concurrent conflicting patches yield one winner and one conflict. Read again
before changing the intent of a stale request.

SEO follows Page publication: updates change only the selected draft's SEO and mark draft changes.
Preview selects the draft snapshot; public rendering selects the published snapshot. Read fresh Page
publication state and use the separate `elems_publish_page` call to publish. SEO metadata is part of
compiled draft/published artifacts and their revision hashes, not a duplicate authoring model or
additional URL fields. Modern's existing title, description and preview-image controls use the same
fields and lifecycle. Older unversioned published artifacts retain their previous SEO on the first
edit. Legacy Pages can author/read SEO and preview/publish their canonical SEO draft using their
existing compiled content. This does not expose raw HTML mutation or legacy element authoring.

Runtime replaces legacy SEO declarations with one effective `<title>`, `name="description"`,
canonical link, Open Graph title/description/image/url/type, and Twitter card/title/description/image.
OG type is `website` for ordinary Pages; Twitter uses `summary_large_image` with a valid public image
and `summary` without one. SVG remains a valid public OG image, while Twitter omits SVG
images and uses `summary`. Missing descriptions/images are omitted, including their social tags.
The legacy database description sentinel `0` is treated as absent. Canonical and OG URLs are the
same derived HTTPS production URL: the existing preferred attached custom domain wins over the
managed preview domain; without a custom domain, the preferred managed domain is used. Redirected
and deleted domains are excluded. The preferred domain's default locale (or Website default) has no
locale prefix; other locales have their existing prefix. Homepage uses `/`, or the localized root;
ordinary Pages use their canonical slug. Preview tokens, query strings and fragments are excluded.
Without an attached domain, URL tags are omitted. Templates keep unrelated head declarations.
