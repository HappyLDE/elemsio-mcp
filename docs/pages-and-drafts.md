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
-> SEO readiness read/CAS as required for public Pages -> draft readback
-> get draft preview -> inspect generated head -> browser/content QA
-> publish only when explicitly requested -> live head verification -> final SEO report
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

## Canonical Page SEO

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

## Public Page SEO definition of done

Every newly created or materially updated **public Website Page** must receive an SEO readiness check
before publication or final acceptance, even when the user did not ask for SEO, unless they explicitly
request otherwise. This is the canonical public Page completion policy for ELEMS agents and operators.
It does not authorize publication, additional tenant access, translation writing, or changes outside
the task. Private/internal/auth-only Pages follow the site's indexing/privacy architecture; do not make
Login, Account, protected Course consumption, checkout, or account-private surfaces indexable merely to
satisfy this checklist.

Small changes such as spacing, borders, tiny responsive polish, or moving a section without changing
Page meaning require SEO **readiness verification**, without unnecessary mutation of already-good SEO.
New Pages, changed Product/service focus, major Homepage repositioning, Course/product launches, and
major content rewrites require review of whether title, description, and social image should change.

### Readiness checklist and canonical capability

Use the currently exposed canonical Page SEO capability described above: selected-locale Page SEO
readback and a fresh compare-and-set update of title, meta description, and existing Website Media
association when needed. Read current tool schemas and canonical limits; never require a fixed tool
count or version as permanent policy. Do not inject head tags or invent alternate SEO authoring fields
when the capability is unavailable; report the missing capability.

For each public Page and published locale, inspect these effective generated head values:

1. Page title.
2. Meta description for indexable public Pages.
3. Canonical URL.
4. OG title.
5. OG description.
6. OG image or the explicit missing-image result below.
7. OG URL.
8. OG type according to the canonical Runtime projection.
9. Twitter/social metadata where Runtime emits it, including card, title, description, and image.
10. Duplicate/conflicting head declarations, including legacy/template declarations.
11. Production-domain correctness across canonical and social URL tags.

Validate the stored/readback state **and** the effective preview/live head. Check coherent Runtime
projection rather than assuming a stored field proves output. Do not accept duplicated or conflicting
title, description, canonical, OG, or Twitter tags. Follow Runtime's documented omission/fallback rules;
absence of an image must use the explicit exception below, not a false PASS.

### Title and meta description

Every public Page should have a meaningful page-specific title derived from its actual purpose and
content. Replace placeholders such as `Home`, `About`, `Page`, `Untitled`, `Lorem ipsum`, or `TEST` when
a meaningful title can be derived. Respect Website title-composition semantics and avoid duplicating
Website branding. Validate the **effective generated title**, including the Website title-format
setting; checking only the stored title is insufficient.

Every indexable public Page should have a concise, meaningful meta description faithful to its actual
content and within the canonical ELEMS limits. Do not invent claims, stuff keywords, use lorem ipsum,
or substitute unrelated generic marketing copy. If content is insufficient for a truthful description,
report that explicitly rather than invent facts or claim description PASS.

For a public Product/Course offer, reflect the real commercial content: real Product/Course name,
faithful description, and relevant existing cover/thumbnail. Do not leave `TEST`, `QA`, `temporary`, or
other placeholder metadata on customer-facing published Pages.

### Canonical URL and production domain

Verify the effective canonical URL and OG URL, including locale routing. When a production custom
domain exists, both must use that production domain. A managed preview `*.myelems.com` URL is not an
acceptable canonical for a live custom-domain Website. Follow canonical preferred-domain and locale
semantics; do not author raw URL overrides. Preview routes, tokens, query strings, and fragments must
not leak into canonical/social URLs. Report missing or incorrect domain projection explicitly.

### Existing social-image selection

Inspect the Page/content and its existing Website Media. Select the **most semantically relevant
existing image**, not the first Media item or arbitrary ordering:

- Product/Course Page: its real Product/Course cover or thumbnail.
- Article/content Page: its article hero or cover.
- Service Page: its primary service hero or image.
- Homepage: the strongest representative hero, product, or brand image.

Use an existing canonical Website Media item. Do not automatically generate an image, upload a duplicate
merely for OG, use a protected ResourceAsset, select unrelated decoration or foreign-Website Media, or
invent an external URL. Prefer an appropriate existing derivative/original according to canonical SEO
implementation. Prefer a suitable raster/image MIME for social compatibility; account for the documented
SVG/Twitter behavior above rather than claiming Twitter image coverage that Runtime does not emit.

When possible, verify same-Website ownership, public Media status, appropriate image MIME, HTTP
accessibility, absence of protection, correct canonical Media association, and Runtime OG/Twitter
projection. Report any unavailable verification instead of assuming it passed.

If **no suitable existing image** is available, do not block publication/completion solely for that
reason unless the user/project specifically requires one. Do not generate imagery automatically or
silently select a poor/unrelated image. Publish/complete when all other requirements pass and publication
is authorized, then state clearly in the final report:

```text
OG IMAGE MISSING — no suitable existing Website Media was available.
```

This lets the user/operator decide whether to provide or create imagery later. A missing image is a
reported allowed exception, not permission to ignore the other readiness checks.

### Locale and completion flow

SEO is locale-specific where ELEMS supports localized Page SEO. For every published locale, verify a
title and description fitting that locale, its canonical locale route, and no locale bleed. Do not
blindly copy Romanian SEO into English, French, or another locale. If translations are unavailable and
the task does not authorize writing them, report missing locale SEO rather than silently inventing or
copying it. Record any issue or verification blocker; do not claim complete SEO readiness without the
required evidence. The missing-image exception and an explicit user opt-out remain bounded exceptions.

The normal public Page completion flow is:

```text
content work -> SEO readiness read -> SEO CAS update if required -> draft readback
-> preview -> inspect generated head -> visual/content QA
-> publish when authorized -> live head verification -> final report
```

Do not publish SEO metadata blindly without preview/readback where the canonical workflow supports it.
Use a fresh Page publication revision after SEO changes; publish is still a separate deliberate action.
For draft-only tasks, stop at the validated draft and report that publication/live verification was not
performed. For published Pages, verify the actual live production head and each published locale.

### Compact final SEO report

For tasks creating, publishing, or materially changing public Pages, include this compact status per
Page/locale. Keep it visible; do not bury a missing image in a long generic checklist.

```text
SEO:
- title: PASS / issue
- description: PASS / issue
- canonical: PASS / issue
- OG metadata: PASS / issue
- OG image: Media <id> / MISSING
- production-domain check: PASS / issue
- duplicates: PASS / issue
```

Include Twitter/social projection in the OG metadata status, and identify preview-only or unavailable
verification as an issue. If the image is missing, include the explicit `OG IMAGE MISSING` statement
above even when the other checks pass. Respect explicit opt-outs and privacy architecture in the report.
