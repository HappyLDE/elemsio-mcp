# Elements and Safe Targeting

Load this resource for ELEMS tree structure, element fields, inspection metadata, and mutation target
selection. For structural syntax and limits, also load `elems://docs/markup-v1`.

## Element model

A modern page or template is a rooted tree. Each element has a parent (except the root), ordered
children, and a stable `mdid`. Common author-facing fields are:

- `domType`: rendered semantic element such as `div`, `h2`, `a`, `button`, `img`, or `input`.
- `name`: an editor/inspection label; it is not visible page text by itself.
- `content`: localized text keyed by locale.
- `attributes`: values such as `href`, `src`, localized `alt`, and the canonical `class` string.
- `children`: ordered child elements.
- `functionType`, `functionData`, and `commands`: allowlisted runtime behavior. Load the function and
  command resources only when dynamic behavior matters.

Do not send raw element-tree JSON or HTML. Structural creation uses canonical Markup V1. Normal
visible text belongs in localized element content, not in `name` and not as injected HTML.

Common safe structural `domType` values are `section`, `div`, `article`, `aside`, `nav`, `h1`-`h6`,
`p`, `span`, `a`, `button`, `ul`, `ol`, `li`, `img`, `picture`, `source`, `figure`, `figcaption`,
`small`, `strong`, `em`, `blockquote`, `cite`, `br`, `label`, `input`, `textarea`, `select`, and
`option`. The auth/account profile also permits `form`. Markup V1 remains authoritative for the
current element and attribute allowlists. Raw page-shell `header`/`footer` elements are not import
targets; shared shell content belongs to the effective template.

## Identity is operation-specific

`mdid` is the stable element identity, but not every tool accepts a bare `mdid`. Always pass the exact
mutation-ready identifier and fresh hash emitted by the matching inspection surface:

| Change | Inspection field |
| --- | --- |
| Localized text/attribute or `href` | `elements[].update_target_id` and current value/hash |
| Classes | `class_targets[].mdid` and `classes_hash` |
| Behavior | `behavior_targets[].target_id` and `behavior_hash` |
| Existing owned JavaScript | `script_targets[].target_id` and `script_hash` |
| HTML Embed | `html_embeds[].mdid` and `embed_hash` |
| Narrow child insert/delete | `structural_targets[]` and parent `children_hash` |
| Full section replacement | `sections[].replace_target_id` |

`snapshot_target_id` is read-only metadata. Do not construct namespaced target IDs, strip parts from
them, substitute a search-result `target_id`, or guess an `mdid`.

Some older builder-authored links may expose a current `href` beginning with the exact canonical
`{{ base_url }}` prefix. This is a migration-ready precondition, not accepted new content: pass the
returned value and hash back unchanged as the expected state, then replace it with a normal safe
relative, `http`, or `https` destination. Arbitrary Liquid, protocol-relative origins, executable
schemes, event attributes, and non-allowlisted attributes remain unavailable.

## Inspection versus authority

Search can return page-owned, template-owned, shared-prefab, or unknown elements. A found element is
only a location. It is authorized for a particular write only when the relevant target array exposes
the mutation input and its ownership/mutability flags permit that operation in the selected scope.

`suggested_inspection_root` means “this is a compact subtree worth reading.” It explicitly has
`inspection_only: true` and `mutation_authorized: false`. The deprecated `suggested_edit_root` has the
same meaning. A section may be structurally replaceable yet still be far too broad for the requested
edit.

Page scope mutates only `page_owned` paths. Template scope mutates only `template_owned` paths and
requires the inspected effective `template_id`. Resolved prefab instances (`shared_prefab`) and
unknown ownership fail closed. Inspection may show them so the composed page can be understood, but
it does not make them writable.

## Narrow example

To change one card heading, search distinctive text, inspect the returned subtree, select that
heading's `elements[].update_target_id`, preserve the exact current-value precondition, update one
locale, and read it back. Do not replace the card or its section merely because the search suggested
the section as an inspection root.
