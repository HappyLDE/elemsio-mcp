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
| Existing or initial owned JavaScript | `script_targets[].target_id` and `script_hash` |
| HTML Embed | `html_embeds[].mdid` and `embed_hash` |
| Narrow child insert/delete | `structural_targets[]` and parent `children_hash` |
| Full section replacement | `sections[].replace_target_id` |

Static HTML `id` is an eligible nonlocalized attribute on ordinary page- or template-owned elements.
Inspect the exact `elements[].update_target_id` ending in `:attribute:id`, then pass it unchanged to
`elems_update_element` with the exact current value/hash (`null` means no id). New IDs must match
`[A-Za-z][A-Za-z0-9_-]{0,127}` and be unique in the affected page tree. The write preserves other
attributes and element content, uses CAS, regenerates drafts, and never publishes.

`snapshot_target_id` is read-only metadata. For JavaScript only, use the canonical
`md:<mdid>:javascript` selector with an mdid returned by the same page/template inspection; do not
guess an mdid or use a search-result target as a mutation input. Other namespaced mutation target IDs
must still be copied unchanged from their matching inspection array.

JavaScript inspection is opt-in. Without `script_target_id`, `script_targets` is empty by design and
does not prove that no JavaScript can be added. When the selector addresses a normal owned element
whose `contentJavascript` is absent, null, or empty, the selected target reports an empty source and
the SHA-256 hash of that empty source. `elems_update_element_javascript` can then set the
ELEMS-managed `contentJavascript` property. ELEMS renders a populated property as that element's
`<script>` output; this is separate from raw `<script>` markup, which remains forbidden by Markup V1
and HTML Embed.

For a native contact form, inspect `behavior_targets[].contact_form` together with its ordinary
element attributes and command bindings. The descriptor reports whether the provider is on a
semantic `<form>`, its POST method, type and recipient, native field types/bindings/required flags,
the Runtime challenge, explicit submit type, and success/error state bindings. A provider attached
to a `div` is not a semantic contact form.

Some older builder-authored links may expose a current `href` beginning with the exact canonical
`{{ base_url }}` prefix. Pass the returned value and hash back unchanged as the expected state. A
client never sends that Liquid as a replacement `value`; replace it with a normal safe relative,
`http`, or `https` destination, or with a Page destination (below). Arbitrary Liquid,
protocol-relative origins, executable schemes, event attributes, and non-allowlisted attributes
remain unavailable.

### Locale-aware Page destinations

To point an anchor `attribute:href` target at a Page of the same website, call `elems_update_element`
in text mode with `destination_page_id` instead of `value` (the two are mutually exclusive, and
`destination_page_id` is accepted only for `attribute:href` targets). The server resolves that Page
within the request's website and stores the canonical `{{ base_url }}/<slug>` href (`{{ base_url }}/`
for the homepage). Runtime renders `base_url` as the visitor's canonical locale base, the same prefix
native menu Page destinations use, so one stored value opens the Page in every active locale: no
prefix for the default locale and `/<locale>` otherwise. Missing, cross-website, redirect,
non-ordinary, and unsafe-slug Pages fail closed (`destination_page_not_found`,
`destination_page_not_supported`, `destination_page_slug_not_supported`). The slug is resolved at
write time; renaming the Page later does not rewrite the link. Readback returns the stored
`{{ base_url }}/...` value, which is the next CAS precondition.

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

## Static text inside runtime function contexts

Elements under a recognized runtime function owner, such as a native `cart` drawer or a canonical
product provider, normally report `dynamic_function_context` for structure, DOM type, and behavior.
The owner's script renders runtime output into nodes it selects by class, id, data attribute, or tag.
Hand-authored copy beside that output, such as a delivery notice or a summary label, can still be
mutation-ready text.

A descendant receives a localized `content` target in `elements[].update_target_id` only when all of
the following hold:

- it is a leaf with no children;
- it has no function, function data, commands, or loop bindings, and no script, embed, prefab, or
  template-region ownership of its own;
- every locale value is plain text with no Liquid delimiters and no markup;
- no script on its ancestor path selects it through its own class, id, data attribute, or tag. A
  `document.createElement('tag')` argument creates a new node and is not a selector;
- an owner script containing Liquid contains only the canonical native cart binding line
  (`window.cart = {{ elementFunction_cart.cart | json }}`) on a native `cart` owner. Any other
  template expression keeps that script unclassifiable, and the descendant stays protected.

Replacing such a value changes only the text the Runtime renders for that leaf. The function owner,
its `functionType`/`functionData`, commands, and script are unchanged. Runtime scripts locate the
nodes they update by stable DOM hooks, not by visible copy, so new wording does not move a selector
match. Leaves that are runtime output (for example a total written with `innerHTML`), command-bound
or loop-bound leaves, and Liquid-bearing leaves expose no text target and are rejected by
`elems_update_element`. DOM-type, structural, behavior, and JavaScript restrictions in these
contexts are unaffected; the owner and every non-leaf element keep their protections. Use the
ordinary text CAS flow: the write is draft-only and never publishes.

### Static links inside runtime function contexts

An `a` leaf in such a context is a *static link leaf* when it meets the static leaf rules above, has
no event-handler attribute or other Liquid-bearing attribute, and its `href` is Liquid-free or the
exact canonical `{{ base_url }}/...` form. For such a link only, an ancestor script's selector
literals are evaluated against the link instead of matching every anchor by tag:

- a selector list is understood only when it uses type, universal, class, id, and attribute selectors
  with descendant/child/sibling combinators. Pseudo-classes (including `:not()`), escapes, and anything
  else stay on the conservative path: any `a` in the literal still counts as a reference;
- an item can be ruled out only by its right-most (subject) compound: a different element type, a
  class the link does not have, or an `href` predicate that is provably false. Ids and other
  attributes never rule a match out, and a literal equal to one of the link's own attribute values
  stays a reference;
- a Liquid-free `href` is rendered verbatim, so every attribute operator is decided exactly. A
  `{{ base_url }}<path>` href renders as an unknown locale-aware prefix followed by `<path>`, so only
  `=` and `$=` predicates decided by `<path>` can be false; `*=`, `^=`, `~=`, and `|=` may always
  match. Use `a[href$="/cart"]`, not `a[href*="cart"]`, when a script must not claim such a link;
- a string that cannot be a CSS selector (for example a translated message containing ". " or "!")
  selects nothing and is not a reference.

The refinement applies only to ancestor scripts that reach existing nodes through literal selector
calls. A script that uses child or sibling traversal, `children`/`childNodes`, `document.links`,
`getElementsBy*`, XPath or ranges, observer node lists, `event.target` other than
`event.target.closest(...)`, a destructured `target`, or a computed selector argument keeps the
existing conservative classification. As before, only scripts on the link's ancestor path are
classified.

When the refinement removes every reference, the link text gets an ordinary `content` target, and the
link's `attribute:href` target is exposed with `internal_destination_only: true`. Such an href accepts
only a same-origin path (`/...`, never `//...` or a backslash) or a `destination_page_id` Page
destination; external URLs fail with `external_link_destination_not_supported`. Every replacement is
classified again against the proposed value at the final compare-and-set: a destination that an
ancestor selector would match (for example `/cart` under `a[href$="/cart"]`) fails with
`link_destination_runtime_bound`. The link's DOM type, structure, behavior, and the owner script stay
protected; class edits use `elems_update_element_classes` as before. Hrefs outside runtime contexts
keep their existing rules.

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
