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

Template text and behavior updates, class changes, JavaScript replacement, insertion, and deletion
each have distinct targets and CAS hashes. Behavior-capable Markup V1 insertion is available only
through the template insertion contract and the shared allowlist; validate first with
`elems_validate_template_element`. Page insertion is static-only outside the exact auth/account
profile supported by section validation/import.

Template publication uses the fresh template draft revision and is separate from page publication.
A page preview composes the isolated template draft with the page so shared changes can be verified
before cutover.

## Example

If a page search finds a logo inside the shared header, its result may be `template_owned` even though
the search began from a page. Do not pass that result to a page mutation. Read the effective template,
inspect its element targets, update the narrow logo target in template scope, then preview at least one
affected page.
