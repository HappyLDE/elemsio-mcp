# Templates and Ownership

Load this resource when work affects shared layout, the effective template, or template-owned
elements visible while inspecting a page.

## Composition

A website owns pages and may own modern V2 templates. A page selects an effective template: its
explicit assigned template when present, otherwise the website's applicable default. The rendered
page composes template-owned shell/layout with the page-owned content tree. Shared headers, navigation,
footers, and other site-wide layout normally belong to that template.

Inspection may therefore show multiple ownership classes:

- `page_owned`: mutable only with page-scoped tools;
- `template_owned`: mutable only with template scope and the exact effective `template_id`;
- `shared_prefab`: resolved shared content, inspectable but not mutable through page/template element
  mutations;
- `unknown`: fail closed.

The website must own both the page root and effective template root for the corresponding mutation
surface to be exposed.

## Correct template workflow

```text
elems_get_page -> retain effective template_id
-> elems_get_template_elements -> select exact mutation target/hash
-> perform template-scoped narrow mutation
-> inspect again -> preview through an affected page -> browser QA
-> elems_publish_template only when explicitly requested
```

## Independent detached templates

`elems_list_templates` returns the complete pageable Modern V2 inventory, including templates that
no page uses. Use the returned cursor until `has_more` is false. `elems_create_template` provisions
an independent V2 shell and draft. It does not change the website default or assign existing pages;
the idempotency key is required for safe retries.

Detached templates use the same template tools without `page_id`: inspect with
`elems_get_template_elements`, then use the returned structural and behavior targets with
`elems_validate_template_element`, `elems_insert_template_element`, `elems_update_element`, and
`elems_delete_element`. The API verifies the template belongs to the scoped website and resolves its
Mongo root directly; it does not invent a page context or substitute the website default. A
`functionType: "menu"` provider must reference a menu owned by that same website.

Generate a draft with `elems_generate_template_draft`, passing the current
`expected_draft_revision`. For CSS needed by existing pages, pass their bounded IDs in
`coverage_page_ids`. The returned manifest records each page fingerprint. Template edits retain the
declared coverage set; a page whose content or class registry changes makes coverage stale until the
draft is generated and published again with fresh coverage. Publish the detached template with
`elems_publish_template` and the exact returned draft revision. Publication changes only the
template artifacts.

To attach an existing V2 page, pass the fresh `ta:<revision>` token to
`elems_assign_page_template` with `operation: "assign"`. The target must be published, current, and
cover that page's current fingerprint. The operation returns its before/after mapping and a receipt
ID. Assignment changes live template composition immediately; it does not publish or regenerate the
page. To reverse it, inspect the page again, then call the same tool with `operation: "reverse"`, the
receipt ID, and the new current assignment revision. A stale revision or intervening assignment
blocks reversal.

Template text and behavior updates, class changes, JavaScript replacement, insertion, and deletion
each have distinct targets and CAS hashes. Behavior-capable Markup V1 insertion is available only
through the template insertion contract and the shared allowlist; validate first with
`elems_validate_template_element`. Page insertion is static-only outside the exact auth/account
profile supported by section validation/import.

## Safe head declarations

`elems_get_template_elements` exposes `head_declarations` separately from ordinary structural
targets. Its `head.children_hash` is the creation/removal structure precondition; each inspected
stylesheet declaration also has a stable target, whole-declaration hash, ownership, and removability.

`elems_create_head_declaration` currently accepts only the closed `stylesheet_link` profile and one
absolute external HTTPS `href`. The server creates exactly `<link rel="stylesheet" href="…">` under
the canonical template `<head>` with no extra attributes, content, children, scripts, or behavior.
Exact duplicate URLs return `already_exists` without a write.

`elems_remove_head_declaration` removes only declarations carrying safe-API ownership established at
creation, with both the declaration hash and enclosing head children hash as CAS preconditions. The
canonical command-owned `templateCssUrl` stylesheet and existing declarations of unknown provenance
are inspectable as protected and cannot be changed or removed. `script`, `meta`, inline `style`, raw
head HTML, arbitrary attributes, and `link` elements in body Markup V1 remain unsupported. Both tools
regenerate every active-locale template draft, compensate on failure, and never publish.
Ordinary template insertion/deletion and DOM-type tools also reject the head declaration subtree, so
they cannot bypass this ownership boundary.

Template-owned images follow the same isolation rule: inspect the effective template, then mutate an
eligible `attribute:src`/localized `attribute:alt` target or insert canonical Markup V1 in template
scope. Image sources must be exact canonical URLs from the same website's ELEMS Media. A page-scoped
request cannot mutate a template-owned image, and a template ID from another website or page context
does not grant authority.

Menu-provided labels and items are runtime behavior, not ordinary text while their own command is
present. For an intentionally static label, update its exact `behavior_targets[]` entry to remove the
binding, inspect again, then update the newly exposed text target. Static text inside a valid menu
provider becomes editable only after its own runtime command is absent; loop/name/URL-bound menu
items remain protected. Inspection normalizes the established legacy `loop` spelling to canonical
`loop:` so existing menu behavior can be migrated through the same CAS-protected behavior tool.

Template publication uses the fresh template draft revision and is separate from page publication.
A page preview composes the isolated template draft with the page so shared changes can be verified
before cutover.

## Example

If a page search finds a logo inside the shared header, its result may be `template_owned` even though
the search began from a page. Do not pass that result to a page mutation. Read the effective template,
inspect its element targets, update the narrow logo target in template scope, then preview at least one
affected page.
