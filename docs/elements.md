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

Do not send raw element-tree JSON or HTML. Structural creation uses canonical Markup V1: the element
token on each markup line is its creation `domType`. Normal visible text belongs in localized element
content, not in `name` and not as injected HTML.

Common safe structural `domType` values are `section`, `div`, `article`, `aside`, `nav`, `h1`-`h6`,
`p`, `span`, `a`, `button`, `ul`, `ol`, `li`, `img`, `picture`, `source`, `figure`, `figcaption`,
`small`, `strong`, `em`, `blockquote`, `cite`, `br`, `label`, `input`, `textarea`, `select`, and
`option`. The auth/account profile also permits `form`. Markup V1 remains authoritative for the
current element and attribute allowlists. Raw page-shell `header`/`footer` elements are not import
targets; shared shell content belongs to the effective template.

An existing eligible ordinary element can change between the same safe structural types (except the
protected `section` ownership type) with `elems_update_element_dom_type`. Inspect
`dom_type_targets[]`, pass its exact `target_id` and `dom_type_hash`, and select the destination from
the tool's closed enum. Invalid structures (for example, children under a destination `img`),
dynamic/script/embed-owned targets, shared/prefab structures, roots, and shell/declaration types are
rejected. Declaration/head types such as `link` remain outside ordinary Markup V1 and DOM-type
mutation. The separate template head-declaration capability supports only its closed safe profiles.

## Identity is operation-specific

`mdid` is the stable element identity, but not every tool accepts a bare `mdid`. Always pass the exact
mutation-ready identifier and fresh hash emitted by the matching inspection surface:

| Change | Inspection field |
| --- | --- |
| Localized text/attribute, `href`, or image `src` | `elements[].update_target_id` and current value/hash |
| Classes | `class_targets[].mdid` and `classes_hash` |
| DOM type | `dom_type_targets[].target_id` and `dom_type_hash` |
| Head stylesheet declaration | `head_declarations.head.children_hash`, then the declaration `target_id` and `declaration_hash` for removal |
| Behavior | `behavior_targets[].target_id` and `behavior_hash` |
| Existing owned JavaScript | `script_targets[].target_id` and `script_hash` |
| HTML Embed | `html_embeds[].mdid` and `embed_hash` |
| Narrow child insert/delete | `structural_targets[]` and parent `children_hash` |
| Full section replacement | `sections[].replace_target_id` |

`snapshot_target_id` is read-only metadata. Do not construct namespaced target IDs, strip parts from
them, substitute a search-result `target_id`, or guess an `mdid`.

For a native contact form, inspect `behavior_targets[].contact_form` together with its ordinary
element attributes and command bindings. The descriptor reports whether the provider is on a
semantic `<form>`, its POST method, type and recipient, native field types/bindings/required flags,
the Runtime challenge, explicit submit type, and success/error state bindings. A provider attached
to a `div` is not a semantic contact form.

Some older builder-authored links may expose a current `href` beginning with the exact canonical
`{{ base_url }}` prefix. This is a migration-ready precondition, not accepted new content: pass the
returned value and hash back unchanged as the expected state, then replace it with a normal safe
relative, `http`, or `https` destination. Arbitrary Liquid, protocol-relative origins, executable
schemes, event attributes, and non-allowlisted attributes remain unavailable.

## Image targets

An eligible page- or template-owned `img` exposes separate mutation-ready `attribute:src` and
localized `attribute:alt` targets. Change `src` with `elems_update_element`, passing the exact current
value/hash and an exact canonical image URL returned by same-website ELEMS Media. The server resolves
that URL against the website's Media Library; arbitrary external, missing, non-image, cross-website,
non-HTTPS, `data:`, `javascript:`, and `vbscript:` references fail closed.

To insert an image, use normal Markup V1 such as `img` with localized `alt`, optional dimensions and
loading/decoding attributes, and the exact same-website Media URL as `src`. Validate section imports
before import; narrow page/template insertion uses the fresh parent `children_hash`. Responsive
`srcset`/`sizes` are not currently in the public attribute allowlist. Inline handlers such as
`onerror`, raw HTML, and inline style remain forbidden.

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

## Move and reparent existing elements

`elems_move_element` supports Page and Template ownership. Existing calls remain compatible:
`website_id` plus `page_id` uses Page scope when `scope` is omitted or `page`. Template calls require
`scope: template`, `website_id`, and `template_id`; omit `page_id`. Cross-owner and cross-Website
moves are forbidden, even when element IDs collide.

Read fresh `move_context` from `elems_get_page_elements`, `elems_get_element_subtree`, or
`elems_get_template_elements`. Choose exact `target_mdid` with `can_move: true` and
`destination_parent_mdid` with `can_parent: true`; pass its whole-root `tree_hash` unchanged as
`expected_tree_hash`. Template inspection also exposes existing draft/published revisions.

Use `placement: before | after | first | last`. Before/after requires `anchor_mdid`, a different
ordered direct child of the destination. First/last forbids an anchor. Position is computed after
removing the existing source: A B C D, move D after A, becomes A D B C. Reparenting uses the same
operation between supported neutral containers. Template destinations include body and ordinary
header/main/footer containers; fixed header/footer regions can contain moved ordinary descendants.
Roots, HTML shell, head declarations, content slots, shared prefabs, cycles, invalid anchors,
incompatible list/select/picture children, and inherited runtime data contexts fail closed.

The exact existing element and descendant mdids, complete subtree, localized content, attributes,
classes/responsive classes, Media, links, behavior/action bindings, and script metadata survive.
Only containment and sibling order change. This operation does not create or delete elements,
accept arbitrary tree fields, edit scripts, or promise to rewrite ancestry-dependent custom scripts.

Supply a distinct `idempotency_key` for each new intent (8–128 alphanumeric/dot/underscore/colon/
hyphen characters, beginning alphanumeric). Retry only with the same key and exact arguments.
Cached success returns `already_applied`; an already-current fresh placement returns `already_current`.
The bounded process-local authoring cache is not durable: after cache loss or across workers a
stale tree hash conflicts and cannot reapply the move. Concurrent conflicting moves have one winner.

Moves regenerate every active-locale owner draft and never publish. Template preview uses the moved
draft while live uses its prior published Template. Read fresh revision and publish separately with
`elems_publish_template`; Page publication continues through `elems_publish_page`. A generation
failure compensates only its own exact post-move root under CAS. Later edits prevent compensation
and return `RECOVERY_REQUIRED` without overwriting them.
